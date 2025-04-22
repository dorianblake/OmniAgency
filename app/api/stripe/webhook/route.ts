// /app/api/webhooks/stripe/route.ts
// Handles incoming Stripe webhook events.
// (Content from omniagency_stripe_webhook)

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

// --- Placeholder DB Interaction ---
// Replace this with your actual database logic
async function updateUserSubscriptionInDB(customerId: string | null, subscription: Stripe.Subscription | null, eventType: string) {
    if (!customerId || !subscription) {
        console.log(`[DB Placeholder] Webhook ${eventType}: Missing customer or subscription ID.`);
        return;
    }
    const planId = subscription.items.data[0]?.price?.id;
    const status = subscription.status;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    console.log(`[DB Placeholder] Webhook ${eventType}: TODO - Update DB for Customer: ${customerId}, Plan: ${planId}, Status: ${status}, Period End: ${currentPeriodEnd}`);
    // Example: await db.user.update({ where: { stripeCustomerId: customerId }, data: { ... } });
}
async function grantAccessOnCheckout(session: Stripe.Checkout.Session) {
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
    const userId = session.metadata?.clerkUserId;
    if (!customerId || !subscriptionId || !userId) return;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log(`[DB Placeholder] Webhook checkout.session.completed: TODO - Grant access for User ${userId}, Plan ${subscription.items.data[0]?.price?.id}`);
    await updateUserSubscriptionInDB(customerId, subscription, 'checkout.session.completed');
}
// --- End Placeholder DB Interaction ---


export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // 1. Check if required data is present
  if (!webhookSecret || !signature || !body) {
    const missing = !webhookSecret ? 'Webhook secret missing' : !signature ? 'Signature missing' : 'Body missing';
    console.error(`Stripe Webhook Error: ${missing}`);
    return new NextResponse(`Webhook Error: ${missing}`, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // 2. Verify the webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 3. Log the received event type
  console.log(`🔔 Stripe Webhook Received: ${event.type}`);

  // 4. Handle the event (add specific logic later)
  try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          console.log(`Checkout successful for session: ${session.id}`);
          // TODO: Fulfill the purchase (e.g., grant access, update database)
          break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'customer.subscription.created':
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`Subscription ${event.type}: ${subscription.id}, Status: ${subscription.status}`);
          // TODO: Update user subscription status in your database
          break;
        case 'invoice.payment_succeeded':
           const invoice = event.data.object as Stripe.Invoice;
           if (invoice.billing_reason === 'subscription_cycle' && invoice.subscription) {
                const subSucceeded = await stripe.subscriptions.retrieve(invoice.subscription as string);
                await updateUserSubscriptionInDB(subSucceeded.customer as string, subSucceeded, event.type);
           }
          break;
        case 'invoice.payment_failed':
          // TODO: Handle failed payments (e.g., notify user)
          console.log(`Webhook received: ${event.type} - Invoice ID: ${(event.data.object as Stripe.Invoice).id}`);
          break;
        default:
          console.warn(`🤷‍♀️ Unhandled Stripe event type: ${event.type}`);
      }
  } catch (error: any) {
      // Catch errors during event handling
      console.error(`Webhook handler error for ${event.type}:`, error);
      return new NextResponse(`Webhook handler error: ${error.message}`, { status: 500 });
  }

  // 5. Return a 200 response to acknowledge receipt of the event
  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
} 