// /actions/stripeActions.ts
// Server actions to handle Stripe Checkout and Billing Portal redirection.
// (Content from omniagency_stripe_actions)
'use server';

import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
// Revert to using path aliases now that files should exist
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { PlanId } from '@/lib/types';

// Helper to get Stripe Price IDs from environment variables
function getStripePriceId(planId: PlanId): string | undefined {
    switch (planId) {
        case 'BASIC': return process.env.STRIPE_BASIC_PRICE_ID;
        case 'PRO': return process.env.STRIPE_PRO_PRICE_ID;
        case 'ENTERPRISE': return process.env.STRIPE_ENTERPRISE_PRICE_ID; // May not exist or be used for direct checkout
        default: return undefined; // Handle FREE or invalid plans
    }
}

// --- GET OR CREATE STRIPE CUSTOMER --- (Updated with DB Save)
export async function getOrCreateStripeCustomerId(): Promise<string | { error: string }> {
  const { userId } = auth();
  const user = await currentUser(); // Need email

  if (!userId || !user?.primaryEmailAddress?.emailAddress) {
    console.error("[Stripe Action - Customer] User not authenticated or email missing.");
    return { error: 'User not authenticated or primary email not found.' };
  }
  const userEmail = user.primaryEmailAddress.emailAddress;

  // 1. Check local DB first
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { stripeCustomerId: true },
  });

  if (dbUser?.stripeCustomerId) {
    console.log(`[Stripe Action - Customer] Found existing Stripe Customer ID in DB: ${dbUser.stripeCustomerId}`);
    return dbUser.stripeCustomerId;
  }

  // 2. Check Stripe customers by email (potential race condition handled by unique constraint)
   try {
        console.log(`[Stripe Action - Customer] Checking Stripe for customer with email: ${userEmail}`);
        const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
        if (customers.data.length > 0) {
            const existingCustomerId = customers.data[0].id;
            console.log(`[Stripe Action - Customer] Found existing Stripe customer by email: ${existingCustomerId}`);
            // Update local DB with the found ID
             try {
                await prisma.user.update({ // Use update to ensure user exists
                    where: { clerkId: userId },
                    data: { stripeCustomerId: existingCustomerId },
                });
                console.log(`[Stripe Action - Customer] Updated local DB with found Stripe Customer ID: ${existingCustomerId}`);
                return existingCustomerId;
             } catch (dbError: any) {
                 // Handle case where user might not exist in DB despite being authenticated (rare)
                 if (dbError.code === 'P2025') { // Prisma record not found
                      console.error(`[Stripe Action - Customer] DB User ${userId} not found during update with existing Stripe ID. This shouldn't normally happen.`);
                      return { error: 'Database user record not found.' };
                 } else {
                      console.error("[Stripe Action - Customer] Error updating DB with existing Stripe ID:", dbError);
                      return { error: 'Failed to save existing Stripe customer ID to database.' };
                 }
             }
        }
   } catch (stripeError) {
        console.error("[Stripe Action - Customer] Error listing Stripe customers:", stripeError);
        // Continue to creation attempt, but log the error
   }

  // 3. Create new customer in Stripe AND update local DB
   try {
        console.log(`[Stripe Action - Customer] Creating new Stripe customer for email: ${userEmail}`);
        const newCustomer = await stripe.customers.create({
            email: userEmail,
            name: user.fullName ?? undefined, // Add name if available
            metadata: {
                clerkUserId: userId, // Link Clerk user ID
            },
        });
        console.log(`[Stripe Action - Customer] Created new Stripe customer: ${newCustomer.id}`);

        // Update local DB with the new ID
        await prisma.user.update({ // Use update to ensure user exists
            where: { clerkId: userId },
            data: { stripeCustomerId: newCustomer.id },
        });
         console.log(`[Stripe Action - Customer] Updated local DB with new Stripe Customer ID: ${newCustomer.id}`);
        return newCustomer.id;

   } catch (error: any) {
        // Handle potential errors during Stripe creation or DB update
        if (error.code === 'P2025') { // Prisma record not found during update
             console.error(`[Stripe Action - Customer] DB User ${userId} not found during update with new Stripe ID.`);
             // Attempt to roll back Stripe creation? Or flag for manual review?
             // For now, return error.
             return { error: 'Database user record not found after creating Stripe customer.' };
        } else {
             console.error("[Stripe Action - Customer] Error creating Stripe customer or updating DB:", error);
             return { error: 'Failed to create Stripe customer or save ID to database.' };
        }
   }
}

// --- CREATE CHECKOUT SESSION --- (Logic mostly unchanged, relies on updated getOrCreateStripeCustomerId)
export async function createCheckoutAction(planId: PlanId): Promise<{ error: string } | void> {
    const { userId } = auth();
    if (!userId) {
      return { error: 'User not authenticated.' };
    }

    const priceId = getStripePriceId(planId);
    if (!priceId) {
      return { error: `Invalid plan or missing Price ID for plan: ${planId}` };
    }
    // Prevent self-checkout for Enterprise typically
    if (planId === 'ENTERPRISE') {
         return { error: 'Enterprise plans require contacting sales.' };
    }

    const customerResult = await getOrCreateStripeCustomerId();
    if (typeof customerResult !== 'string') { // Check if error object was returned
        return customerResult; // Propagate the error
    }
    const customerId = customerResult;

    // TODO: Check if user already has an active subscription to this or higher plan?
    // const currentUserPlan = await prisma.user.findUnique({ where: { clerkId: userId }, select: { planId: true }});
    // if (currentUserPlan?.planId === planId) { return { error: 'Already subscribed to this plan.' }; }

    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/billing?checkout=success&plan=${planId}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/billing`;

    try {
        console.log(`[Stripe Action - Checkout] Creating Checkout session for Plan: ${planId}, Price: ${priceId}, Customer: ${customerId}`);
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            metadata: {
                clerkUserId: userId,
                planId: planId, // Store plan ID for webhook handler
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
            // allow_promotion_codes: true,
        });

        if (!checkoutSession.url) {
            console.error("[Stripe Action - Checkout] Checkout session created but URL is missing.");
            return { error: 'Could not create Stripe Checkout session URL.' };
        }

        redirect(checkoutSession.url); // Redirect user to Stripe Checkout

    } catch (error: any) {
        console.error("[Stripe Action - Checkout] Stripe Checkout Error:", error);
        return { error: `Stripe Error: ${error.message || 'Failed to create checkout session.'}` };
    }
}


// --- CREATE BILLING PORTAL SESSION --- (Logic mostly unchanged)
export async function createPortalAction(): Promise<{ error: string } | void> {
    const { userId } = auth();
    if (!userId) {
        return { error: 'User not authenticated.' };
    }

     // Get customer ID (must exist to manage billing)
     const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { stripeCustomerId: true },
     });

    const customerId = dbUser?.stripeCustomerId;

    if (!customerId) {
         console.warn(`[Stripe Action - Portal] User ${userId} tried to access portal without a Stripe Customer ID.`);
         return { error: 'Stripe customer account not found. Please subscribe to a plan first.' };
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/billing`;

    try {
        console.log(`[Stripe Action - Portal] Creating Billing Portal session for Customer: ${customerId}`);
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });

        if (!portalSession.url) {
            console.error("[Stripe Action - Portal] Portal session created but URL is missing.");
            return { error: 'Could not create Stripe Billing Portal session URL.' };
        }

        redirect(portalSession.url); // Redirect user to Stripe Billing Portal

    } catch (error: any) {
        console.error("[Stripe Action - Portal] Stripe Portal Error:", error);
        return { error: `Stripe Error: ${error.message || 'Failed to create billing portal session.'}` };
    }
} 