// /app/(dashboard)/billing/page.tsx (Themed & Functional Buttons)
// Displays billing plans and allows users to select/manage subscriptions via Stripe.

'use client'; // Required for useState and calling Server Actions

import React, { useState, useTransition } from 'react';
import { CheckCircle, CreditCard } from 'lucide-react';
import { subscriptionPlans, PlanId } from '@/lib/stripe'; // Import plans (adjust path)
import { createCheckoutAction, createPortalAction } from '@/actions/stripeActions'; // Import server actions (adjust path)

// Helper component for each plan card
const PlanCard: React.FC<{
    planId: PlanId;
    plan: typeof subscriptionPlans[PlanId];
    isCurrentPlan?: boolean; // Placeholder for indicating current plan
    onSelectPlan: (planId: PlanId) => void;
    isPending: boolean;
}> = ({ planId, plan, isCurrentPlan, onSelectPlan, isPending }) => {
    const isEnterprise = planId === 'enterprise';
    // Example dynamic pricing display (replace with actual logic if needed)
    const displayPrice = isEnterprise ? 'Contact Us' :
                         plan.priceId.includes('pro') ? '$99' :
                         plan.priceId.includes('starter') ? '$49' : 'Custom';

    return (
        <div className={`glassmorphism p-6 rounded-2xl flex flex-col transition-all duration-300 ease-in-out border-2 ${isCurrentPlan ? 'border-primary/80 shadow-glow-primary/50' : 'border-transparent shadow-card hover:shadow-card-hover'} relative transform hover:-translate-y-1`}>
            {isCurrentPlan && (
                 <span className="absolute top-0 right-4 -mt-3 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">Current Plan</span>
            )}
            <h3 className="text-xl font-semibold mb-2 text-dark-text-primary">{plan.name}</h3>
            <p className="text-3xl font-bold mb-4 text-dark-text-primary">
                {displayPrice}
                {!isEnterprise && <span className="text-sm font-normal text-dark-text-secondary">/mo</span>}
            </p>
            <ul className="space-y-2 text-dark-text-secondary mb-6 text-sm flex-grow">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                        <CheckCircle className="w-4 h-4 inline mr-2 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button
                onClick={() => onSelectPlan(planId)}
                disabled={isPending || isCurrentPlan || isEnterprise} // Disable button if pending, current plan, or enterprise
                className={`w-full mt-auto font-medium py-2.5 px-4 rounded-lg transition-all duration-300 ease-in-out text-sm ${isCurrentPlan ? 'bg-gray-600/50 text-dark-text-secondary cursor-not-allowed' : isEnterprise ? 'bg-cyan-600/80 hover:bg-cyan-500/80 text-white cursor-pointer' : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md hover:shadow-glow-primary disabled:opacity-50 disabled:cursor-wait'}`}
            >
                {isPending ? 'Processing...' : isCurrentPlan ? 'Your Plan' : isEnterprise ? 'Contact Sales' : 'Choose Plan'}
            </button>
        </div>
    );
};


export default function BillingPage() {
  // State for loading indicators and potential errors
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [portalPending, startPortalTransition] = useTransition();

  // Placeholder: Determine the user's current plan from your database
  // This should be fetched server-side ideally or via a client-side hook
  const currentPlanId: PlanId | null = null; // Example: User has no active plan initially

  const handleSelectPlan = (planId: PlanId) => {
    setError(null); // Clear previous errors
    startTransition(async () => {
        // Get base URL for redirects
        const redirectBaseUrl = window.location.origin;
        const result = await createCheckoutAction(planId, redirectBaseUrl);
        if (result?.error) {
            setError(result.error);
            // Optionally use a toast notification library for errors
        }
        // If successful, the server action handles the redirect.
    });
  };

  const handleManageSubscription = () => {
     setError(null);
     startPortalTransition(async () => {
         const returnUrl = window.location.href; // Return to the current billing page
         const result = await createPortalAction(returnUrl);
         if (result?.error) {
             setError(result.error);
             // Optionally use a toast notification library for errors
         }
         // If successful, the server action handles the redirect.
     });
  };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold text-dark-text-primary">Billing & Subscription</h1>

       {/* Display Error Messages */}
        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}

      {/* Current Subscription / Manage Section */}
      <section className="glassmorphism p-6 rounded-2xl shadow-card">
        <h2 className="text-lg font-medium mb-4 text-dark-text-primary">Manage Subscription</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <div>
             <p className="text-dark-text-primary">
                {currentPlanId && subscriptionPlans[currentPlanId as PlanId] ? // Explicitly cast and check
                    `You are currently on the ${subscriptionPlans[currentPlanId as PlanId].name} plan.` :
                    'You do not have an active subscription.'
                }
             </p>
             {/* Placeholder for renewal date - fetch from DB if subscribed */}
             {currentPlanId && <p className="text-sm text-dark-text-secondary">Renews on May 21, 2025 (Placeholder)</p>}
           </div>
           {/* Only show manage button if user has a plan (or potentially always show if portal handles no subscription state) */}
           {/* For this example, we assume portal requires a customer ID which might exist even without a sub */}
           <button
             onClick={handleManageSubscription}
             disabled={portalPending}
             className="bg-white/10 hover:bg-white/20 text-dark-text-primary font-medium py-2 px-5 rounded-lg transition-all duration-200 border border-dark-border disabled:opacity-50 disabled:cursor-wait text-sm whitespace-nowrap"
           >
             {portalPending ? 'Loading Portal...' : 'Manage Subscription'}
           </button>
        </div>
      </section>

      {/* Available Plans Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-dark-text-primary">Choose Your Plan</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {(Object.keys(subscriptionPlans) as PlanId[]).map((planId) => (
            <PlanCard
              key={planId}
              planId={planId}
              plan={subscriptionPlans[planId]}
              isCurrentPlan={planId === currentPlanId}
              onSelectPlan={handleSelectPlan}
              isPending={isPending}
            />
          ))}
        </div>
      </section>

       {/* Payment Method Section (Placeholder - Managed via Stripe Portal) */}
       <section className="glassmorphism p-6 rounded-2xl shadow-card mt-8">
         <h2 className="text-lg font-medium mb-4 text-dark-text-primary">Payment Method</h2>
         <div className="flex items-center justify-between">
           <div className="flex items-center space-x-3">
             <CreditCard className="w-8 h-8 text-dark-text-secondary" />
             <div>
               <p className="font-medium text-dark-text-primary">Manage via Stripe</p>
               <p className="text-sm text-dark-text-secondary">Update your payment details securely through the portal.</p>
             </div>
           </div>
           <button
                onClick={handleManageSubscription}
                disabled={portalPending}
                className="text-sm text-primary hover:text-indigo-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
            >
                {portalPending ? 'Loading...' : 'Update Payment'}
            </button>
         </div>
       </section>
    </div>
  );
} 