// This page requires client-side interactivity for modals and potentially state updates
// However, fetching initial data can still be done server-side.
import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import AgentCard from '@/components/dashboard/agent-card';
import { CreateAgentDialog } from '@/components/dashboard/create-agent-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAgentsAction } from '@/actions/agentActions'; // Import the action to fetch agents

// Server Component to fetch and display the agent list initially
async function AgentList() {
    const { userId } = auth(); // Ensure user is authenticated
    if (!userId) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>User not found. Please sign in again.</AlertDescription>
            </Alert>
        );
    }

    // Fetch agents using the server action
    const result = await getAgentsAction();

    if (!result.success || !result.agents) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error Fetching Agents</AlertTitle>
                <AlertDescription>{result.error || "Could not load agent data. Please try again later."}</AlertDescription>
            </Alert>
        );
    }

    const agents = result.agents;

    if (agents.length === 0) {
        return (
            <div className="text-center text-muted-foreground mt-8">
                <p>No agents found.</p>
                <p>Click "Create Agent" to get started.</p>
            </div>
        );
    }

    // Note: The interaction logic (edit/delete) needs to be handled client-side.
    // This server component only renders the initial list.
    // State updates after create/delete will require client-side logic or full page refresh.
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
                // Pass necessary handlers (onEdit, onDelete) to AgentCard if
                // AgentCard is made a client component or if a managing
                // client component wraps this list.
            ))}
        </div>
    );
}

// Main page component (remains a Server Component for initial load)
export default function AgentsPage() {
    return (
        <div className="container mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold md:text-3xl">AI Agents</h1>
                {/* CreateAgentDialog can trigger the server action directly */}
                <CreateAgentDialog>
                    <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Agent
                    </Button>
                </CreateAgentDialog>
            </div>

            {/* Agent List Area */}
            <Suspense fallback={
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span>Loading agents...</span>
                </div>
            }>
                {/* Render the server component that fetches the data */}
                {/* @ts-expect-error Async Server Component is valid */}
                <AgentList />
            </Suspense>
        </div>
    );
} 