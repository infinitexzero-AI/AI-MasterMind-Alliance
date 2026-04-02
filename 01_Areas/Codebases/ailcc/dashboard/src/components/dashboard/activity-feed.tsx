"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Globe, Smartphone, Sparkles } from 'lucide-react';

interface ActivityItem {
  id: string;
  agent: string;
  action: string;
  timestamp: number;
  status: 'info' | 'success' | 'warning' | 'error';
}

export const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const getAgentIcon = (agent: string) => {
    switch (agent.toLowerCase()) {
      case 'comet': return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'valentine': return <Smartphone className="w-4 h-4 text-pink-400" />;
      case 'coder': return <Terminal className="w-4 h-4 text-green-400" />;
      default: return <Sparkles className="w-4 h-4 text-blue-400" />;
    }
  };

  const getAgentColor = (agent: string) => {
    switch (agent.toLowerCase()) {
      case 'comet': return 'text-cyan-400';
      case 'valentine': return 'text-pink-400';
      case 'coder': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  // Simulate incoming stream
  useEffect(() => {
    const interval = setInterval(() => {
      const agents = ['Comet', 'Valentine', 'Coder', 'Gemini'];
      const actions = {
        'Comet': ['Scanned portal', 'Found new resource', 'Analyzed dataset'],
        'Valentine': ['Relayed notification', 'Synced with iOS', 'Push alert sent'],
        'Coder': ['Refactored component', 'Fixed text-error', 'Deployed build'],
        'Gemini': ['Updated context', 'Optimized memory', 'Verified logic']
      };

      const agent = agents[Math.floor(Math.random() * agents.length)];
      const agentActions = actions[agent as keyof typeof actions];
      
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        agent: agent,
        action: agentActions[Math.floor(Math.random() * agentActions.length)],
        timestamp: Date.now(),
        status: ['info', 'success', 'success', 'info'].sort(() => 0.5 - Math.random())[0] as any
      };
      
      setActivities(prev => [newActivity, ...prev].slice(0, 50));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-gray-100 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
        Live Agent Feed
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-700">
        <AnimatePresence initial={false}>
          {activities.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-800/50 p-3 rounded border border-gray-700/50 flex items-center justify-between group hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full bg-gray-900/50 border border-gray-700`}>
                  {getAgentIcon(item.agent)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-200">{item.action}</div>
                  <div className={`text-xs font-mono opacity-80 ${getAgentColor(item.agent)}`}>
                    @{item.agent.toLowerCase()}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {new Date(item.timestamp).toLocaleTimeString([], { hour12: false })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {activities.length === 0 && (
          <div className="text-center text-gray-500 py-10 italic">
            Waiting for agent activity...
          </div>
        )}
      </div>
    </div>
  );
};
