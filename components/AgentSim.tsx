// /components/AgentSim.tsx (Themed)
// (Content from omniagency_agent_sim_final)
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Clock } from 'lucide-react';

interface Message {
  id: number;
  sender: 'user' | 'agent';
  text: string;
  timestamp: number;
}

const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const AgentSim: React.FC = () => {
  const initialTimestamp = Date.now();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'agent', text: "Hello! I'm OmniAgent, your AI Sales Assistant. How can I help you find the right solution today?", timestamp: initialTimestamp },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentTyping]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const getAgentResponse = useCallback((userMessage: string): string => {
     return "Thanks for reaching out! I've received your message and will connect you with a specialist soon to discuss this further.";
  }, []);

  const handleSendMessage = useCallback((event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isAgentTyping) return;

    const newUserMessage: Message = { id: Date.now(), sender: 'user', text: trimmedInput, timestamp: Date.now() };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');

    setIsAgentTyping(true);
    setTimeout(() => {
      const agentText = getAgentResponse(trimmedInput);
      const newAgentMessage: Message = { id: Date.now() + 1, sender: 'agent', text: agentText, timestamp: Date.now() };
      setMessages((prev) => [...prev, newAgentMessage]);
      setIsAgentTyping(false);
    }, 1200);
  }, [inputValue, isAgentTyping, getAgentResponse]);

  return (
    <div className="glassmorphism rounded-2xl shadow-lg flex flex-col h-[500px] max-h-[70vh] w-full max-w-lg mx-auto overflow-hidden border border-dark-border/50">
      <div className="p-4 border-b border-dark-border/50 flex items-center space-x-3 bg-dark-card/80 backdrop-blur-sm">
         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 flex items-center justify-center border border-white/20"> <Bot className="w-5 h-5 text-cyan-300" /> </div>
        <h3 className="font-semibold text-dark-text-primary">AI Agent Simulation</h3>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-dark-bg/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-start max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
               <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-dark-border/50 ${msg.sender === 'agent' ? 'bg-indigo-800/50 mr-2' : 'bg-gray-700/50 ml-2'}`}> {msg.sender === 'agent' ? <Bot size={18} className="text-indigo-300"/> : <User size={18} className="text-gray-300"/>} </div>
               <div className={`px-4 py-2 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-dark-card text-dark-text-primary rounded-bl-none border border-dark-border/50'}`}> <p className="text-sm leading-relaxed">{msg.text}</p> </div>
            </div>
             <div className={`text-xs text-dark-text-secondary mt-1 px-1 flex items-center ${msg.sender === 'user' ? 'mr-10' : 'ml-10'}`}> <Clock size={10} className="mr-1 opacity-70" /> {formatTimestamp(msg.timestamp)} </div>
          </div>
        ))}
        {isAgentTyping && ( /* Typing Indicator */ <div className="flex justify-start"> <div className="flex items-start"> <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-dark-border/50 bg-indigo-800/50 mr-2"> <Bot size={18} className="text-indigo-300"/> </div> <div className="px-4 py-2 rounded-2xl bg-dark-card text-dark-text-primary rounded-bl-none border border-dark-border/50"> <div className="flex space-x-1 items-center h-5"> <span className="w-1.5 h-1.5 bg-dark-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span> <span className="w-1.5 h-1.5 bg-dark-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span> <span className="w-1.5 h-1.5 bg-dark-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span> </div> </div> </div> </div> )}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t border-dark-border/50 bg-dark-card/80 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input type="text" value={inputValue} onChange={handleInputChange} placeholder="Type your message..." disabled={isAgentTyping} className="flex-grow px-4 py-2 rounded-lg bg-dark-bg/80 border border-dark-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm text-dark-text-primary placeholder-dark-text-secondary transition duration-200 disabled:opacity-60" />
          <button type="submit" disabled={!inputValue.trim() || isAgentTyping} className="p-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"> <Send size={20} /> </button>
        </form>
      </div>
    </div>
  );
};
export default AgentSim; 