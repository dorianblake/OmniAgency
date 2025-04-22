// /components/AgentCard.tsx (Themed)
// (Content from omniagency_components_themed)
import React from 'react';
import { Bot, Power, MessageSquare } from 'lucide-react';

interface AgentCardProps {
  name: string;
  status: 'online' | 'offline';
  avatar?: React.ReactNode;
  description?: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ name, status, avatar, description }) => {
  const isOnline = status === 'online';

  return (
    <div className="glassmorphism p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 ease-in-out flex flex-col justify-between min-h-[180px] transform hover:-translate-y-1">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center border border-white/20 shadow-inner">
              {avatar ? React.cloneElement(avatar as React.ReactElement, { className: "w-5 h-5 text-primary" }) : <Bot className="w-5 h-5 text-primary" />}
            </div>
            <h4 className="text-lg font-semibold text-dark-text-primary">{name}</h4>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1.5 border ${
              isOnline
                ? 'bg-green-500/10 text-green-300 border-green-500/30'
                : 'bg-gray-500/10 text-dark-text-secondary border-gray-500/30'
            }`}
          >
            <Power className={`w-3 h-3 ${isOnline ? 'text-green-400' : 'text-gray-500'}`} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </span>
        </div>
        {description && (
          <p className="text-sm text-dark-text-secondary mb-4">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center justify-end mt-auto pt-4 border-t border-dark-border/50">
         <button className="flex items-center justify-center px-4 py-2 text-sm font-medium text-dark-text-secondary bg-white/5 hover:bg-white/10 border border-dark-border rounded-lg transition-all duration-200">
           <MessageSquare className="w-4 h-4 mr-2" />
           Message
         </button>
        {/* Optional: Add configure button here */}
      </div>
    </div>
  );
};

export default AgentCard; 