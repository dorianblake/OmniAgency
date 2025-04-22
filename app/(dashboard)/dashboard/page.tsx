// /app/(dashboard)/dashboard/page.tsx (Themed & Enhanced)
// The main dashboard page, displaying welcome message, metrics and agent cards.

// Import themed components
import MetricCard from "@/components/MetricCard"; // Themed version
import AgentCard from "@/components/AgentCard";   // Themed version
import { currentUser } from '@clerk/nextjs/server'; // Fetch user data server-side
import { BarChart2, Users, MessageCircle, PlusCircle, Briefcase, PhoneCall } from 'lucide-react';

export default async function DashboardPage() {
  // Fetch user data on the server for the welcome message
  const user = await currentUser();
  const welcomeName = user?.firstName || 'User'; // Use first name or fallback

  // Data for metrics and agents
  const metrics = [
    { title: "Leads Captured", value: 152, icon: Users, change: "+12% this month" },
    { title: "Sales Closed", value: 38, icon: Briefcase, change: "+5% this month" },
    { title: "Conversations This Week", value: 215, icon: MessageCircle },
  ];
  const agents = [
     { name: "Sales Qualifier Pro", status: "online" as const, avatar: <Briefcase />, description: "Qualifies inbound leads and schedules demos." },
     { name: "Support Assistant", status: "online" as const, avatar: <MessageCircle />, description: "Answers common questions and provides basic support." },
     { name: "Appointment Booker", status: "offline" as const, avatar: <PhoneCall />, description: "Follows up on warm leads to book calls." },
  ];

  return (
    <div className="space-y-8"> {/* Add spacing between sections */}

      {/* Welcome Message */}
      <h1 className="text-2xl md:text-3xl font-semibold text-dark-text-primary">
        Welcome back, {welcomeName}!
      </h1>

      {/* Metrics Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-dark-text-secondary uppercase tracking-wider">Performance Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric) => (
            <MetricCard // Uses themed component
              key={metric.title} // Key for React list rendering
              label={metric.title} // Pass title as label prop
              value={metric.value}
              // icon={metric.icon} // Pass icon if MetricCard expects it
              // change={metric.change} // Pass change if MetricCard expects it
            />
          ))}
        </div>
      </section>

      {/* Agents Section */}
      <section>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-dark-text-secondary uppercase tracking-wider">Your AI Agents</h2>
           {/* Themed Button with Glow Effect */}
           <button className="flex items-center bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium py-2 px-5 rounded-lg transition-all duration-300 ease-in-out shadow-md hover:shadow-glow-primary text-sm sm:text-base">
             <PlusCircle className="w-5 h-5 mr-2" />
             Create New Agent
           </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard // Uses themed component
              key={agent.name}
              name={agent.name}
              status={agent.status}
              avatar={agent.avatar}
              description={agent.description}
            />
          ))}
          {/* Optional: Add a placeholder card for creating new agents */}
          {/* <div className="glassmorphism rounded-2xl border-2 border-dashed border-dark-border/50 flex items-center justify-center min-h-[220px] text-dark-text-secondary hover:border-primary/50 hover:text-primary transition-colors duration-300 cursor-pointer">
            <div className="text-center">
              <PlusCircle className="w-10 h-10 mx-auto mb-2" />
              <span>Add New Agent</span>
            </div>
          </div> */}
        </div>
      </section>
    </div>
  );
} 