'use client';

import React from 'react';
import { Bot, Terminal, Globe, Activity, MessageSquare, Brain, Sparkles } from 'lucide-react';
import ImageGenerator from './ImageGenerator';
import WorkflowTrigger from './WorkflowTrigger';

import { motion } from 'framer-motion';

const defaultAgents = [
  { name: 'Valentine', role: 'Orchestrator', icon: Brain, color: 'text-pink-400', border: 'border-pink-500/30', bg: 'bg-pink-950/20', status: 'ONLINE' },
  { name: 'Antigravity', role: 'Inner Loop (Code)', icon: Terminal, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-950/20', status: 'ACTIVE' },
  { name: 'Comet', role: 'Outer Loop (Web)', icon: Globe, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-950/20', status: 'IDLE' },
  { name: 'SuperGrok', role: 'Strategy', icon: Activity, color: 'text-white', border: 'border-slate-500/30', bg: 'bg-slate-900/40', status: 'STANDBY' },
  { name: 'Claude', role: 'Deep Coding', icon: MessageSquare, color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-950/20', status: 'LINKED' },
  { name: 'ChatGPT', role: 'Backup/GitHub', icon: Bot, color: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-950/20', status: 'OFFLINE' },
  { name: 'Gemini', role: 'Multi-Modal', icon: Sparkles, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-950/20', status: 'LINKED' },
];

interface Agent {
    name: string;
    role: string;
    status: string;
    conversations?: number;
}

export default function AgentGrid({ agents: liveAgents }: { agents?: Agent[] }) {
  
  // Merge live data with defaults
  const agents = defaultAgents.map(def => {
      const live = liveAgents?.find(la => la.name === def.name);
      return live ? { ...def, status: live.status } : def;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full relative overflow-y-auto pb-20">
      
      {/* Valentine (Main Command) - Wide Tile */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-1 md:col-span-2 row-span-1 p-4 rounded-xl border border-pink-500/30 bg-pink-950/10 backdrop-blur-sm relative overflow-hidden group min-h-[120px]"
      >
        <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-1" title="Orchestrator Pulse">
                <span className="w-1 h-1 bg-pink-500 rounded-full animate-ping" />
                <span className="w-1 h-1 bg-pink-500 rounded-full" />
            </div>
        </div>
        <div className="flex items-center gap-3 mb-2">
            <Brain className="w-6 h-6 text-pink-400" />
            <h2 className="text-pink-100 font-bold uppercase tracking-wider">Valentine Core</h2>
        </div>
        <div className="font-mono text-sm text-pink-300/70">
            System Orchestration Active. Monitoring {agents.length - 1} satellite agents.
        </div>
      </motion.div>

      {/* Workflow Trigger (N8N) - Single Tile */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="col-span-1 row-span-2"
      >
        <WorkflowTrigger />
      </motion.div>

      {/* Project Status (Linear/GitHub) - RESERVED for future use or kept as simplified view */}
      {/* We removed ProjectStatus from here as it's now in the sidebar in page.tsx. 
          We can replace this slot with another widget or leave empty/expand others. 
          For now, let's keep a placeholder or remove it to shift layout. 
          Actually, the layout grid expects items. Let's make ImageGen wider or add a stats card.
      */}
      
      {/* Image Gen (Interactive) - Wide Tile */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="col-span-1 md:col-span-3 row-span-2"
      >
        <ImageGenerator />
      </motion.div>

      {/* Other Agents */}
      {agents.slice(1).map((agent, i) => (
        <motion.div
          key={agent.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => {
              if (agent.name.includes('Comet')) {
                  window.open('https://www.perplexity.ai', '_blank');
              }
          }}
          className={`p-4 rounded-xl border ${agent.border} ${agent.bg} backdrop-blur-sm flex flex-col justify-between group hover:bg-opacity-40 transition-all cursor-pointer min-h-[100px]`}
        >
            <div className="flex justify-between items-start">
                <agent.icon className={`w-5 h-5 ${agent.color}`} />
                <span className={`text-[10px] font-mono px-1 py-0.5 rounded border ${agent.border} ${agent.color} uppercase`}>
                    {agent.status}
                </span>
            </div>
            <div>
                <h3 className={`font-bold font-mono ${agent.color}`}>{agent.name}</h3>
                <p className="text-xs text-slate-400 font-mono uppercase">{agent.role}</p>
            </div>
        </motion.div>
      ))}

    </div>
  );
}

