// /components/TopNav.tsx (Themed)
// (Content from omniagency_components_themed)
import React from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs'; // Use client version if needed in client components
// If used purely in Server Components:
// import { UserButton } from '@clerk/nextjs/server';
// import { currentUser } from '@clerk/nextjs/server';

const TopNav = () => {
  // const user = await currentUser(); // Fetch user if needed server-side

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-dark-card shadow-md border-b border-dark-border h-16 flex-shrink-0">
      {/* Logo */}
      <Link href="/dashboard" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 hover:opacity-80 transition-opacity">
        OmniAgency
      </Link>

      {/* Right side - User Button */}
      <div className="flex items-center space-x-4">
        <div className="[&>button]:rounded-full [&>button]:shadow-md">
             <UserButton afterSignOutUrl="/" appearance={{
                 elements: { // Match Clerk theme to app theme
                     userButtonAvatarBox: "w-9 h-9 ring-2 ring-white/10 hover:ring-primary/50 transition-all",
                     userButtonPopoverCard: "bg-dark-card border border-dark-border text-dark-text-primary rounded-xl shadow-xl",
                     userButtonPopoverActionButton__signOut: "text-red-400 hover:bg-red-900/50",
                     userButtonPopoverActionButtonText: "text-dark-text-secondary",
                     userButtonPopoverActionButtonIcon: "text-dark-text-secondary",
                     userButtonPopoverFooter: "hidden", // Optional: hide footer
                 }
             }} />
        </div>
      </div>
    </header>
  );
};

export default TopNav; 