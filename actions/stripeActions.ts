// /actions/stripeActions.ts
// Server actions to handle Stripe Checkout and Billing Portal redirection.
// (Content from omniagency_stripe_actions)
'use server';

import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe, subscriptionPlans, PlanId } from '@/lib/stripe';

// --- Placeholder DB Interaction ---
// Replace this with your actual database logic (e.g., using Prisma, Drizzle, etc.)
async function getOrCreateStripeCustomerId(userId: string, email: string): Promise<string> {
  console.warn(`[DB Placeholder] Simulating DB lookup/creation for user ${userId}`);
  // 1. Check DB (Placeholder)
  // const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
  // if (dbUser?.stripeCustomerId) return dbUser.stripeCustomerId;

  // 2. Check Stripe (Real call)
  const customers = await stripe.customers.list({ email: email, limit: 1 });
  if (customers.data.length > 0) {
    const customerId = customers.data[0].id;
    // TODO: Save customerId to your DB
    // await db.user.update({ where: { clerkId: userId }, data: { stripeCustomerId: customerId } });
    console.log(`[DB Placeholder] Found existing Stripe customer ${customerId} for user ${userId}. TODO: Save to DB.`);
    return customerId;
  }

  // 3. Create in Stripe (Real call)
  const newCustomer = await stripe.customers.create({ email: email, metadata: { clerkUserId: userId } });
  // TODO: Save newCustomer.id to your DB
  console.log(`[DB Placeholder] Created new Stripe customer ${newCustomer.id} for user ${userId}. TODO: Save to DB.`);
  return newCustomer.id;
}
// --- End Placeholder DB Interaction ---


export async function createCheckoutAction(planId: PlanId, redirectBaseUrl: string) {
  const { userId } = auth();
  const user = await currentUser();
  if (!userId || !user?.primaryEmailAddress?.emailAddress) return { error: 'User not authenticated' };

  const plan = subscriptionPlans[planId];
  if (!plan || !plan.priceId.startsWith('price_')) return { error: `Invalid plan selected: ${planId}` };

  try {
    const customerId = await getOrCreateStripeCustomerId(userId, user.primaryEmailAddress.emailAddress);
    // TODO: Add logic to check for existing subscriptions before creating a new one.

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], mode: 'subscription', customer: customerId,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      metadata: { clerkUserId: userId, planId: planId },
      success_url: `${redirectBaseUrl}/dashboard?checkout=success`, // Simple success redirect
      cancel_url: redirectBaseUrl + '/billing',
    });

    if (checkoutSession.url) redirect(checkoutSession.url);
    else return { error: 'Could not create Stripe Checkout session.' };

  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return { error: `Stripe Error: ${error.message}` };
  }
}

export async function createPortalAction(returnUrl: string) {
    const { userId } = auth();
    const user = await currentUser();
    if (!userId || !user?.primaryEmailAddress?.emailAddress) return { error: 'User not authenticated' };

    try {
        const customerId = await getOrCreateStripeCustomerId(userId, user.primaryEmailAddress.emailAddress);
        if (!customerId || customerId.includes('_placeholder_')) return { error: 'Subscription details not found.' }; // Basic check for placeholder

        const portalSession = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });

        if (portalSession.url) redirect(portalSession.url);
        else return { error: 'Could not create Stripe Billing Portal session.' };

    } catch (error: any) {
        console.error("Stripe Portal Error:", error);
        return { error: `Stripe Error: ${error.message}` };
    }
} 