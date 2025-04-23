// /app/api/webhooks/stripe/route.ts
// Handles incoming Stripe webhook events.
// (Content from omniagency_stripe_webhook)

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { PlanId } from '@/lib/types';

// Helper function to map Stripe Price ID to our PlanId Enum
function mapPriceIdToPlanId(priceId: string | null | undefined): PlanId {
    if (!priceId) return 'FREE'; // Default to FREE if no price ID
    // This mapping relies on environment variables being set correctly
    if (priceId === process.env.STRIPE_BASIC_PRICE_ID) return 'BASIC';
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'PRO';
    if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return 'ENTERPRISE';
    console.warn(`[Stripe Webhook] Unknown Stripe Price ID encountered: ${priceId}. Defaulting to FREE plan.`);
    return 'FREE'; // Fallback for unknown price IDs
}

// Placeholder for granting access based on plan (implement actual logic)
function grantFeatureAccess(userId: string, planId: PlanId | null) {
     console.log(`[Feature Access] TODO: Update access for User ${userId} based on Plan ID: ${planId}`);
     // Example: Update user flags/limits in DB based on planId
     // const limits = { agentCount: planId === 'PRO' ? 10 : (planId === 'BASIC' ? 2 : 0), ... };
     // await prisma.user.update({ where: { clerkId: userId }, data: { featureLimits: limits } });
}

// Helper function to update user subscription details in DB
async function updateUserSubscription(
    customerId: string,
    subscription: Stripe.Subscription | null,
    eventType: string
) {
    console.log(`[Stripe Webhook - DB Update] Processing ${eventType} for Customer: ${customerId}`);

    // Find user by Stripe Customer ID
    const user = await prisma.user.findUnique({
        where: { stripeCustomerId: customerId },
        select: { clerkId: true }, // Select only the ID we need
    });

    if (!user?.clerkId) {
         console.error(`[Stripe Webhook - DB Update Error] User with Stripe Customer ID ${customerId} not found in DB for event ${eventType}.`);
         // This could happen if customer created directly in Stripe or DB sync issue
         return; // Cannot proceed without linking to a DB user
    }

    const clerkUserId = user.clerkId;

    // Prepare data based on whether subscription exists
    const dataToUpdate = subscription
      ? {
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price?.id ?? null,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          planId: mapPriceIdToPlanId(subscription.items.data[0]?.price?.id),
        }
      : {
          // If subscription is null (e.g., deleted event)
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: null, // Or keep for grace period?
          planId: 'FREE', // Revert to FREE plan
        };

    try {
        await prisma.user.update({
            where: { clerkId: clerkUserId },
            data: dataToUpdate,
        });
        console.log(`[Stripe Webhook - DB Update] Success for User ${clerkUserId} (Customer ${customerId}), Event: ${eventType}, Sub: ${subscription?.id ?? 'N/A'}`);

        // Grant/revoke feature access based on the new plan
        grantFeatureAccess(clerkUserId, dataToUpdate.planId);

    } catch (error: any) {
         console.error(`[Stripe Webhook - DB Update Error] Failed for User ${clerkUserId} (Customer ${customerId}), Event: ${eventType}:`, error);
         // Log error but don't necessarily fail the webhook response
    }
}

// --- STRIPE WEBHOOK HANDLER --- (Updated with DB Logic)
export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Stripe Webhook Error: Webhook secret not configured.");
    return new NextResponse('Webhook secret not configured', { status: 500 });
  }
  if (!signature) {
     console.error("Stripe Webhook Error: Signature missing from request.");
    return new NextResponse('Missing Stripe-Signature header', { status: 400 });
  }
   if (!body) {
     console.error("Stripe Webhook Error: Request body missing.");
    return new NextResponse('Missing request body', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Stripe Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook signature error: ${err.message}`, { status: 400 });
  }

  // Process the event
  console.log(`🔔 Stripe Webhook Received: ${event.type}`);
  try {
    switch (event.type) {
      // --- Checkout Completed --- (Links customer, starts subscription)
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Processing checkout.session.completed for Session: ${session.id}`);
        if (session.mode === 'subscription' && session.subscription && session.customer) {
             const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
             const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;

             // Check metadata for clerkUserId - crucial for linking!
             const clerkUserId = session.metadata?.clerkUserId;
             if (!clerkUserId) {
                 console.error(`[Stripe Webhook Error - checkout.session.completed] Missing clerkUserId in metadata for session ${session.id}`);
                 // Cannot reliably link to DB user without this!
                 break; // Skip processing this event
             }

              // Ensure the user exists and link Stripe Customer ID if needed
             try {
                  await prisma.user.update({
                      where: { clerkId: clerkUserId },
                      data: { stripeCustomerId: customerId }, // Link customer ID
                  });
                  console.log(`[Stripe Webhook - checkout.session.completed] Linked Stripe Customer ${customerId} to User ${clerkUserId}`);
             } catch (dbError: any) {
                 if (dbError.code === 'P2025') { // User not found
                     console.error(`[Stripe Webhook Error - checkout.session.completed] DB User ${clerkUserId} from metadata not found for session ${session.id}. Clerk webhook might be delayed.`);
                     // Consider retrying or flagging
                 } else {
                     console.error(`[Stripe Webhook Error - checkout.session.completed] DB error linking customer ${customerId} to user ${clerkUserId}:`, dbError);
                 }
                 break; // Skip further processing if DB update fails
             }

             // Retrieve the full subscription object to get all details
             const subscription = await stripe.subscriptions.retrieve(subscriptionId);
             await updateUserSubscription(customerId, subscription, event.type);
        } else {
             console.warn(`[Stripe Webhook - checkout.session.completed] Received non-subscription or incomplete session: ${session.id}, Mode: ${session.mode}`);
        }
        break;
      }

      // --- Subscription Updates (Plan changes, cancellations at period end) ---
      case 'customer.subscription.updated': {
         const subscription = event.data.object as Stripe.Subscription;
         console.log(`Processing ${event.type} for Sub: ${subscription.id}, Customer: ${subscription.customer}, Status: ${subscription.status}`);
         // Update DB based on the latest subscription status
         await updateUserSubscription(subscription.customer as string, subscription, event.type);
         break;
      }

       // --- Subscription Deletion (Immediate cancellation, end of trial without payment method) ---
       case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
           console.log(`Processing ${event.type} for Sub: ${subscription.id}, Customer: ${subscription.customer}`);
          // Update DB - passing null for subscription will revert user to FREE plan
          await updateUserSubscription(subscription.customer as string, null, event.type);
          break;
       }

      // --- Recurring Payment Success (Updates period end) ---
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Processing ${event.type} for Invoice: ${invoice.id}, Reason: ${invoice.billing_reason}`);
        // Only update period end for actual subscription cycles
        if (invoice.billing_reason === 'subscription_cycle' && invoice.subscription && invoice.customer) {
           const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
           const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
           // Retrieve the subscription to ensure we have the latest period end
           const subscription = await stripe.subscriptions.retrieve(subscriptionId);
           await updateUserSubscription(customerId, subscription, event.type);
        }
        break;
      }

      // --- Payment Failure --- (Handles failed renewals etc.)
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`[Stripe Webhook - ${event.type}] Payment failed for Invoice: ${invoice.id}, Customer: ${invoice.customer}, Sub: ${invoice.subscription}`);
        // TODO: Notify the user about the failed payment.
        // Consider updating user status in DB (e.g., 'payment_failed') or relying on subscription status changes.
        break;
      }

      // ... handle other relevant events as needed (e.g., disputes, refunds)

      default:
        console.warn(`🤷‍♀️ Unhandled Stripe event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error(`[Stripe Webhook Error] Handler error for ${event.type}:`, error);
    // Return 500 for internal errors during processing
    return new NextResponse(`Webhook handler error: ${error.message || 'Unknown processing error'}`, { status: 500 });
  }

  // Return a 200 response to acknowledge receipt of the webhook
  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
} 