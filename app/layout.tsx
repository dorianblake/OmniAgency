// /app/layout.tsx
// Root layout for the entire application, wraps everything in ClerkProvider.

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Import themed global styles
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from '@clerk/themes'; // Import Clerk dark theme

// Load the Inter font
const inter = Inter({ subsets: ["latin"] });

// Define metadata for the application
export const metadata: Metadata = {
  title: "OmniAgency - AI Sales & Support Agents",
  description: "Create and manage AI agents to handle customer support and sales 24/7.",
};

// RootLayout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ClerkProvider wraps the entire application
    // Apply Clerk's dark theme for consistency
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" className="dark"> {/* Ensure dark class is on html */}
        <body className={`${inter.className} bg-dark-bg text-dark-text-primary`}>
          {/* Render the child components (pages) */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
} 