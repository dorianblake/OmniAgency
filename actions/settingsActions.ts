'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Define Zod schema for validation
const settingsSchema = z.object({
    // Adjust validation rules as needed
    defaultAgentName: z.string().max(50).optional().nullable(),
    welcomeMessage: z.string().max(200).optional().nullable(),
    // Add other settings fields here
});

export type SettingsData = z.infer<typeof settingsSchema>;

export async function updateUserSettingsAction(settingsData: SettingsData): Promise<{ success: boolean; error?: string; errors?: z.ZodIssue[] }> {
    const { userId } = auth();
    if (!userId) {
        return { success: false, error: 'User not authenticated.' };
    }

    // Validate the input data
    const validationResult = settingsSchema.safeParse(settingsData);
    if (!validationResult.success) {
        console.warn('[Settings Action] Validation failed:', validationResult.error.flatten());
        return {
            success: false,
            error: "Invalid settings data provided.",
            errors: validationResult.error.issues,
        };
    }

    const validatedData = validationResult.data;

    try {
        console.log(`[Settings Action] Updating settings for user: ${userId}`);
        await prisma.user.update({
            where: { clerkId: userId },
            data: {
                defaultAgentName: validatedData.defaultAgentName,
                welcomeMessage: validatedData.welcomeMessage,
                updatedAt: new Date(), // Ensure timestamp is updated
                // Add other settings fields here
            },
        });
        console.log(`[Settings Action] Settings updated successfully for user: ${userId}`);

        // Optionally revalidate relevant paths if settings affect other pages
        // revalidatePath('/dashboard');

        return { success: true };

    } catch (error: any) {
        console.error('[Settings Action] Error updating settings:', error);
         if (error.code === 'P2025') { // Prisma record not found
             console.error(`[Settings Action] User ${userId} not found in DB during settings update.`);
             return { success: false, error: 'User not found.' };
         } else {
            return { success: false, error: 'Failed to update settings in database.' };
         }
    }
}

// Optional: Action to get current user settings
export async function getUserSettingsAction(): Promise<{ success: boolean; settings?: SettingsData; error?: string }> {
    const { userId } = auth();
    if (!userId) {
        return { success: false, error: 'User not authenticated.' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: {
                defaultAgentName: true,
                welcomeMessage: true,
                // Select other settings fields
            },
        });

        if (!user) {
            return { success: false, error: 'User not found.' };
        }

        return { success: true, settings: user as SettingsData }; // Cast might be needed depending on selection

    } catch (error) {
        console.error('[Settings Action] Error fetching settings:', error);
        return { success: false, error: 'Failed to fetch settings.' };
    }
} 