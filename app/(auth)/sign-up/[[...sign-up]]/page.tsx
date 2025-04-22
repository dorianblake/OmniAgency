// /app/(auth)/sign-up/[[...sign-up]]/page.tsx
// Renders the Clerk Sign Up component within a themed container.

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
     // Centered layout with dark background
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
       <SignUp
            path="/sign-up" // Ensure path matches route
             appearance={{ // Apply consistent theme
                elements: {
                    card: "bg-dark-card border border-dark-border shadow-xl rounded-2xl",
                    headerTitle: "text-dark-text-primary",
                    headerSubtitle: "text-dark-text-secondary",
                    dividerLine: "bg-dark-border",
                    dividerText: "text-dark-text-secondary",
                    formFieldLabel: "text-dark-text-secondary",
                    formFieldInput: "bg-dark-bg border-dark-border text-dark-text-primary focus:ring-primary/50 focus:border-primary",
                    formButtonPrimary: "bg-primary hover:bg-primary-hover text-white",
                    footerActionText: "text-dark-text-secondary",
                    footerActionLink: "text-primary hover:text-primary-hover",
                }
            }}
        />
    </div>
  );
} 