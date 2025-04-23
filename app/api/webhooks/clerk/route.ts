import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Clerk Webhook Handler
 *
 * Handles user create, update, and delete events from Clerk
 * to keep the local User model synchronized.
 */
export async function POST(req: Request) {
  // Get the necessary headers
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Clerk Webhook Error: CLERK_WEBHOOK_SECRET environment variable not set.');
    return new NextResponse('Internal Server Error: Webhook secret not configured', { status: 500 });
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
     console.error('Clerk Webhook Error: Missing svix headers.');
    return new NextResponse('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err: any) {
    console.error('Clerk Webhook Error: Error verifying webhook signature:', err.message);
    return new NextResponse('Error occurred -- signature verification failed', {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data; // Clerk User ID
  const eventType = evt.type;

  console.log(`🔔 Clerk Webhook Received: Type=${eventType}, ID=${id || 'No ID'}`);

  // --- Handle User Creation ---
  if (eventType === 'user.created') {
    const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses?.find((e) => e.id === evt.data.primary_email_address_id)?.email_address;

    if (!clerkId || !primaryEmail) {
      console.error('Clerk Webhook Error (user.created): Missing clerkId or primary email.');
      return new NextResponse('Error: Missing required user data', { status: 400 });
    }

    try {
      console.log(`[Clerk Webhook] Creating user in DB: ${clerkId}`);
      await prisma.user.create({
        data: {
          clerkId: clerkId,
          email: primaryEmail,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          avatarUrl: image_url,
          planId: 'FREE', // Default plan on creation
          // Initialize other fields as needed
        },
      });
      console.log(`[Clerk Webhook] User created successfully: ${clerkId}`);
       // Important: Set public metadata in Clerk to store local DB ID (optional but good practice)
       // await clerkClient.users.updateUserMetadata(clerkId, {
       //   publicMetadata: {
       //     db_id: createdUser.id, // Store your internal ID
       //   },
       // });

    } catch (error: any) {
      console.error('[Clerk Webhook Error] Failed to create user in DB:', error);
      // Handle potential unique constraint violation if webhook retries
      if (error.code === 'P2002') { // Prisma unique constraint error code
           console.warn(`[Clerk Webhook] User ${clerkId} already exists, likely due to webhook retry. Skipping creation.`);
           return new NextResponse('User already exists', { status: 200 }); // OK response if already handled
      }
      return new NextResponse('Internal Server Error: Failed to process user creation', { status: 500 });
    }
  }

  // --- Handle User Update ---
  if (eventType === 'user.updated') {
    const { id: clerkId, email_addresses, first_name, last_name, image_url, primary_email_address_id } = evt.data;
    const primaryEmail = email_addresses?.find((e) => e.id === primary_email_address_id)?.email_address;

     if (!clerkId) {
      console.error('Clerk Webhook Error (user.updated): Missing clerkId.');
      return new NextResponse('Error: Missing user ID', { status: 400 });
    }

    try {
      console.log(`[Clerk Webhook] Updating user in DB: ${clerkId}`);
      await prisma.user.update({
        where: { clerkId: clerkId },
        data: {
          // Only update email if it's provided and different (optional check)
          ...(primaryEmail && { email: primaryEmail }),
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          avatarUrl: image_url,
          updatedAt: new Date(), // Force update timestamp
        },
      });
       console.log(`[Clerk Webhook] User updated successfully: ${clerkId}`);
    } catch (error: any) {
       // Handle case where user might not exist in DB yet (e.g., if create webhook failed/was delayed)
      if (error.code === 'P2025') { // Prisma record not found error
         console.warn(`[Clerk Webhook] User ${clerkId} not found for update. It might be created shortly.`);
         // Optionally, attempt to create the user here if critical, or rely on creation webhook
         return new NextResponse('User not found for update', { status: 404 });
      } else {
          console.error('[Clerk Webhook Error] Failed to update user in DB:', error);
          return new NextResponse('Internal Server Error: Failed to process user update', { status: 500 });
      }
    }
  }

  // --- Handle User Deletion ---
  if (eventType === 'user.deleted') {
     // Note: Clerk might send a placeholder object for deleted users
     const clerkId = evt.data.id;
     const isDeleted = evt.data.deleted;

     if (!clerkId) {
      console.error('Clerk Webhook Error (user.deleted): Missing clerkId.');
       // Depending on Clerk's payload for deleted users, might need adjustment
      return new NextResponse('Error: Missing user ID', { status: 400 });
    }

     if (!isDeleted) {
        console.warn(`[Clerk Webhook] Received user.deleted event for ${clerkId}, but 'deleted' flag is not true. Skipping DB deletion.`);
        return new NextResponse('Deletion flag not set', { status: 200 });
     }

    try {
      console.log(`[Clerk Webhook] Deleting user from DB: ${clerkId}`);
      await prisma.user.delete({ // Use deleteIfExists if preferred
        where: { clerkId: clerkId },
      });
       console.log(`[Clerk Webhook] User deleted successfully: ${clerkId}`);
    } catch (error: any) {
      if (error.code === 'P2025') { // Prisma record not found error
         console.warn(`[Clerk Webhook] User ${clerkId} not found for deletion. Already deleted or never existed.`);
         return new NextResponse('User not found for deletion', { status: 200 }); // OK if already gone
      } else {
          console.error('[Clerk Webhook Error] Failed to delete user from DB:', error);
          return new NextResponse('Internal Server Error: Failed to process user deletion', { status: 500 });
      }
    }
  }

  // Return a 200 response to acknowledge receipt of the webhook
  return new NextResponse('Webhook processed successfully', { status: 200 });
} 