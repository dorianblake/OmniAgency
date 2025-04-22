// /lib/stripe.ts
// Initializes Stripe client and defines subscription plans.
// (Content from omniagency_stripe_prep, ensure Price IDs match .env.local)

import Stripe from 'stripe';

// Validate that the secret key exists
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe Secret Key in environment variables.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10', // Use the latest API version
  typescript: true,
  // You can add other Stripe configurations here if needed
});

export const subscriptionPlans = {
  starter: {
    name: 'Starter',
    description: 'Basic features for individuals or small teams.',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_placeholder',
    features: ['1 AI Agent', 'Basic Lead Capture', 'Email Support', '1,000 Messages/mo'], // Added example limits
  },
  pro: {
    name: 'Pro',
    description: 'Advanced features for growing businesses.',
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
    features: ['5 AI Agents', 'Advanced Sales Features', 'Priority Support', 'CRM Integration (Soon)', '10,000 Messages/mo'],
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Custom solutions for large organizations.',
    // Enterprise plans often require contacting sales, priceId might not be used directly.
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_placeholder',
    features: ['Unlimited Agents', 'Custom Integrations', 'Dedicated Support', 'Volume Discounts', 'Custom Message Limits'],
  },
};

export type PlanId = keyof typeof subscriptionPlans;

// Placeholder functions for createCheckoutSession and createBillingPortalSession
// These would typically live in server actions or API routes, not directly exported from here.
// See /actions/stripeActions.ts for the implementation.

// Example usage (optional): Fetches Stripe account details
export async function getStripeAccount() {
  try {
    const account = await stripe.accounts.retrieve();
    console.log('Successfully connected to Stripe account:', account.id);
    return account;
  } catch (error) {
    console.error('Error connecting to Stripe:', error);
    throw new Error('Could not connect to Stripe.');
  }
} 