// /components/MetricCard.tsx (Themed)
// (Content from omniagency_components_themed)
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  // icon?: LucideIcon; // Uncomment if you want to pass an icon component
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value }) => {
  return (
    <div className="glassmorphism p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
      {/* Optional: Icon can be placed here */}
      <h3 className="text-sm font-medium text-dark-text-secondary uppercase tracking-wider mb-1">{label}</h3>
      <p className="text-2xl font-semibold text-dark-text-primary">{value}</p>
    </div>
  );
};

export default MetricCard; 