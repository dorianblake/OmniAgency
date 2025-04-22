// /app/page.tsx (Landing Page - Themed)
// Basic themed landing page structure

import Link from 'next/link';
import { CheckCircle, Zap, BarChart, Bot } from 'lucide-react'; // Example icons

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-bg via-dark-bg to-indigo-900/30 text-dark-text-primary">
      {/* Header */}
      <header className="p-4 flex justify-between items-center container mx-auto">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            OmniAgency
        </h1>
        <div className="space-x-4">
          <Link href="/sign-in" className="text-dark-text-secondary hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/sign-up" className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium py-2 px-5 rounded-lg transition-all duration-300 ease-in-out shadow-md hover:shadow-glow-primary text-sm">
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-6 leading-tight">
          Automate Sales & Support <br /> with Your Own AI Agents
        </h2>
        <p className="text-lg text-dark-text-secondary mb-10 max-w-2xl mx-auto">
          OmniAgency empowers your business with AI agents that handle leads, book calls, and close sales 24/7, powered by cutting-edge AI.
        </p>
        <Link href="/sign-up" className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-all duration-300 ease-in-out shadow-lg hover:shadow-glow-primary">
          Create Your First Agent
        </Link>
      </main>

      {/* Features Section */}
      <section className="py-20 bg-dark-bg">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-dark-text-primary mb-16">Why Choose OmniAgency?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Card */}
            <div className="glassmorphism p-8 rounded-2xl text-center transform hover:-translate-y-2 transition-all duration-300">
              <Zap className="w-12 h-12 text-primary mx-auto mb-5" />
              <h4 className="text-xl font-semibold mb-3 text-dark-text-primary">24/7 Availability</h4>
              <p className="text-dark-text-secondary text-sm">Your AI agents work around the clock, capturing leads and engaging customers anytime.</p>
            </div>
             {/* Feature Card */}
            <div className="glassmorphism p-8 rounded-2xl text-center transform hover:-translate-y-2 transition-all duration-300">
              <Bot className="w-12 h-12 text-secondary mx-auto mb-5" />
              <h4 className="text-xl font-semibold mb-3 text-dark-text-primary">Intelligent Conversations</h4>
              <p className="text-dark-text-secondary text-sm">Engage users with natural, AI-powered conversations tailored to their needs.</p>
            </div>
             {/* Feature Card */}
            <div className="glassmorphism p-8 rounded-2xl text-center transform hover:-translate-y-2 transition-all duration-300">
              <BarChart className="w-12 h-12 text-green-400 mx-auto mb-5" />
              <h4 className="text-xl font-semibold mb-3 text-dark-text-primary">Actionable Insights</h4>
              <p className="text-dark-text-secondary text-sm">Track performance and get insights into agent interactions and conversions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center p-10 mt-16 text-dark-text-secondary text-sm border-t border-dark-border">
        © {new Date().getFullYear()} OmniAgency. All rights reserved.
      </footer>
    </div>
  );
} 