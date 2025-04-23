'use server';

import { z } from 'zod'; // For validation
import { auth } from '@clerk/nextjs/server'; // For getting userId
import prisma from '@/lib/prisma'; // Prisma client
import { revalidatePath } from 'next/cache'; // To refresh agent list
import { Agent } from '@prisma/client'; // Import type

// Define validation schema using Zod
const agentSchema = z.object({
  name: z.string().min(3, { message: "Agent name must be at least 3 characters long." }).max(100),
  description: z.string().max(500).optional(),
  prompt: z.string().min(10, { message: "Personality prompt is required and needs some detail." }).max(5000),
  // TODO: Add validation for other fields like config, triggerType, etc.
});

// --- GET AGENTS --- (Recommended Action)
export async function getAgentsAction(): Promise<{ success: boolean, agents?: Agent[], error?: string }> {
  const { userId } = auth();
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const agents = await prisma.agent.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, agents: agents };
  } catch (error) {
    console.error('[Agent Action - Get] Error fetching agents:', error);
    return { success: false, error: 'Failed to fetch agents.' };
  }
}


// --- CREATE AGENT --- (Updated with Prisma)
export async function createAgentAction(formData: FormData) {
  const { userId } = auth();
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
    prompt: formData.get('prompt'),
    // Get other fields from formData as needed
  };

  // Validate form data
  const validationResult = agentSchema.safeParse(rawData);
  if (!validationResult.success) {
     return {
        success: false,
        error: "Validation failed.",
        errors: validationResult.error.flatten().fieldErrors,
      };
  }

  const { name, description, prompt } = validationResult.data;

  try {
    console.log(`[Agent Action - Create] Creating agent for user: ${userId}`);
    const newAgent = await prisma.agent.create({
      data: {
        userId: userId, // Link to the clerkId
        name: name,
        description: description,
        prompt: prompt,
        status: 'OFFLINE', // Default status from Enum
        triggerType: 'MANUAL', // Default trigger
        // TODO: Add other fields like config, tools, etc. from form data
      },
    });
    console.log(`[Agent Action - Create] Agent created successfully: ${newAgent.id}`);

    revalidatePath('/agents'); // Revalidate the page to show the new agent
    return { success: true, agent: newAgent };

  } catch (error) {
    console.error('[Agent Action - Create] Error creating agent:', error);
    return { success: false, error: 'Failed to create agent in database.' };
  }
}

// --- UPDATE AGENT --- (Updated with Prisma - Assuming edit comes later)
export async function updateAgentAction(agentId: string, formData: FormData) {
   const { userId } = auth();
   if (!userId) {
        return { success: false, error: 'User not authenticated.' };
    }

    const rawData = {
        name: formData.get('name'),
        description: formData.get('description'),
        prompt: formData.get('prompt'),
         // Get other fields
    };

    const validationResult = agentSchema.safeParse(rawData); // Use the same schema for updates
    if (!validationResult.success) {
        return {
            success: false,
            error: "Validation failed.",
            errors: validationResult.error.flatten().fieldErrors,
        };
    }

    const { name, description, prompt } = validationResult.data;

    try {
        console.log(`[Agent Action - Update] Updating agent ${agentId} for user: ${userId}`);
        // 1. Verify ownership before updating
        const agentToUpdate = await prisma.agent.findUnique({
            where: { id: agentId },
            select: { userId: true } // Only select needed field
        });

        if (!agentToUpdate || agentToUpdate.userId !== userId) {
             console.warn(`[Agent Action - Update] Permission denied or agent not found. User: ${userId}, Agent: ${agentId}`);
            return { success: false, error: 'Agent not found or permission denied.' };
        }

        // 2. Perform update
        const updatedAgent = await prisma.agent.update({
            where: { id: agentId },
            data: {
                name: name,
                description: description,
                prompt: prompt,
                updatedAt: new Date(), // Manually update timestamp
                // TODO: Update other fields (config, status, etc.)
            },
        });
        console.log(`[Agent Action - Update] Agent updated successfully: ${updatedAgent.id}`);

        revalidatePath('/agents'); // Revalidate page
        return { success: true, agent: updatedAgent };

    } catch (error) {
        console.error('[Agent Action - Update] Error updating agent:', error);
        return { success: false, error: 'Failed to update agent in database.' };
    }
}


// --- DELETE AGENT --- (Updated with Prisma)
export async function deleteAgentAction(agentId: string): Promise<{ success: boolean, error?: string }> {
  const { userId } = auth();
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  if (!agentId) {
    return { success: false, error: 'Agent ID is required.' };
  }

  try {
    console.log(`[Agent Action - Delete] Attempting to delete agent ${agentId} for user: ${userId}`);
    // 1. Verify ownership before deleting
     const agentToDelete = await prisma.agent.findUnique({
        where: { id: agentId },
        select: { userId: true } // Only fetch userId
     });

     if (!agentToDelete) {
        console.warn(`[Agent Action - Delete] Agent ${agentId} not found.`);
         // Arguably success=true if it's already gone
        return { success: true }; // Or { success: false, error: 'Agent not found.' };
     }

     if (agentToDelete.userId !== userId) {
        console.warn(`[Agent Action - Delete] Permission denied. User ${userId} cannot delete Agent ${agentId}.`);
        return { success: false, error: 'Permission denied.' };
     }

    // 2. Perform deletion
    await prisma.agent.delete({ where: { id: agentId } });
    console.log(`[Agent Action - Delete] Agent deleted successfully: ${agentId}`);

    revalidatePath('/agents'); // Refresh the list
    return { success: true };

  } catch (error) {
    console.error('[Agent Action - Delete] Error deleting agent:', error);
    // Handle specific Prisma errors if needed (e.g., P2025 Record to delete does not exist)
    return { success: false, error: 'Failed to delete agent.' };
  }
} 