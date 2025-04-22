// /app/(dashboard)/settings/page.tsx (Themed & Functional Form)
// Page for application or agent settings with a themed form.

'use client'; // Required for using React Hooks like useState

import React, { useState } from 'react'; // Import useState

export default function SettingsPage() {
  // State for controlled form inputs
  const [agentName, setAgentName] = useState('OmniAgent'); // Default value
  const [welcomeMessage, setWelcomeMessage] = useState('Hello! How can I help you today?'); // Default value

  // Dummy submit handler
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    console.log('Submitting settings (dummy):', { agentName, welcomeMessage });
    // In a real app: Replace alert with a toast notification or better feedback
    alert('Settings saved (simulation)! Check console.');
    // TODO: Implement actual API call to save settings to the backend/database
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto"> {/* Centered content */}
      <h1 className="text-2xl md:text-3xl font-semibold text-dark-text-primary">Settings</h1>

      {/* Agent Configuration Form Card */}
      <section className="glassmorphism p-6 md:p-8 rounded-2xl shadow-card">
        <h2 className="text-xl font-semibold mb-2 text-dark-text-primary">Default Agent Configuration</h2>
        <p className="text-sm text-dark-text-secondary mb-6">
          Set the default name and initial greeting for new AI agents.
        </p>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent Name Input */}
          <div>
            <label htmlFor="agentName" className="block text-sm font-medium text-dark-text-secondary mb-1">
              Default Agent Name
            </label>
            <input
              type="text"
              id="agentName"
              name="agentName"
              value={agentName} // Controlled input value
              onChange={(e) => setAgentName(e.target.value)} // Update state on change
              className="mt-1 block w-full rounded-lg border-dark-border bg-dark-card/80 px-4 py-2 text-dark-text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/50 focus:ring-opacity-50 transition duration-200"
              required
            />
          </div>

          {/* Welcome Message Input */}
          <div>
            <label htmlFor="welcomeMessage" className="block text-sm font-medium text-dark-text-secondary mb-1">
              Default Greeting Message
            </label>
            <textarea
              id="welcomeMessage"
              name="welcomeMessage"
              rows={4}
              value={welcomeMessage} // Controlled input value
              onChange={(e) => setWelcomeMessage(e.target.value)} // Update state on change
               className="mt-1 block w-full rounded-lg border-dark-border bg-dark-card/80 px-4 py-2 text-dark-text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/50 focus:ring-opacity-50 transition duration-200"
              required
            ></textarea>
             <p className="mt-1 text-xs text-dark-text-secondary">This message will be used as the initial greeting when a new agent starts a conversation.</p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
             {/* Themed Button */}
            <button
              type="submit"
              className="flex items-center bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-md hover:shadow-glow-primary"
            >
              Save Settings
            </button>
          </div>
        </form>
      </section>

       {/* Placeholder for Account Settings (managed via Clerk UserButton) */}
       <section className="glassmorphism p-6 md:p-8 rounded-2xl shadow-card">
         <h2 className="text-xl font-semibold mb-2 text-dark-text-primary">Account Settings</h2>
         <p className="text-sm text-dark-text-secondary">
           Manage your profile, password, and security settings using the user menu in the top navigation bar.
         </p>
       </section>
    </div>
  );
} 