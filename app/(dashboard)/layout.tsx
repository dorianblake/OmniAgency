// /app/(dashboard)/layout.tsx (Themed)
// Defines the layout for all pages within the (dashboard) group.

import Sidebar from "@/components/Sidebar"; // Use themed version
import TopNav from "@/components/TopNav";   // Use themed version
import React from "react"; // Import React

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Apply base dark background
    <div className="flex h-screen bg-dark-bg">
      <Sidebar /> {/* Themed Sidebar */}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64"> {/* Adjust margin for sidebar */}
        <TopNav /> {/* Themed TopNav */}

        {/* Page Content - Add padding and overflow */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children} {/* The actual page content will be rendered here */}
        </main>
      </div>
    </div>
  );
} 