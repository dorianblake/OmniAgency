// /components/Sidebar.tsx (Themed)
// (Content from omniagency_components_themed)
import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Settings, CreditCard, BotMessageSquare } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    // Add other links like Agents if needed
  ];

  return (
    <aside className="w-64 h-screen bg-dark-card p-6 shadow-lg fixed flex flex-col border-r border-dark-border">
      <div className="mb-10">
        <Link href="/dashboard" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 hover:opacity-80 transition-opacity">
          OmniAgency
        </Link>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-3">
              <Link
                href={item.href}
                className="flex items-center p-3 text-dark-text-secondary hover:text-dark-text-primary hover:bg-white/10 rounded-xl transition-all duration-200 group"
              >
                <item.icon className="w-5 h-5 mr-4 text-dark-text-secondary group-hover:text-primary transition-colors" />
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 