"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Smartphone, Terminal, Brain, Sparkles, Activity, Shield, Zap } from 'lucide-react';
import { useNeuralSync } from '../../../components/NeuralSyncProvider';

interface ElementProps {
  symbol: string;
  name: string;
  category: 'research' | 'logic' | 'ops' | 'relay' | 'security';
  number: number;
  mass: string;
  status: 'active' | 'busy' | 'offline';
  icon: any;
  description: string;
}

const ELEMENTS: ElementProps[] = [
  { symbol: 'Ag', name: 'Antigravity', category: 'ops', number: 0, mass: 'AIMmA.CORE', status: 'active', icon: Zap, description: 'System Orchestration & UI Refinement' },
  { symbol: 'Co', name: 'Comet', category: 'research', number: 1, mass: 'WEB.SEARCH', status: 'active', icon: Globe, description: 'Deep Research & Analysis' },
  { symbol: 'Va', name: 'Valentine', category: 'relay', number: 2, mass: 'iOS.SYNC', status: 'active', icon: Smartphone, description: 'Neural Link / Notifications' },
  { symbol: 'Cd', name: 'Coder', category: 'ops', number: 3, mass: 'DEV.OPS', status: 'busy', icon: Terminal, description: 'Full Stack Implementation' },
  { symbol: 'St', name: 'Strategist', category: 'logic', number: 4, mass: 'PLAN.ARCH', status: 'offline', icon: Brain, description: 'System Architecture' },
  { symbol: 'Sc', name: 'Scholar', category: 'research', number: 5, mass: 'ACAD.EDU', status: 'active', icon: Sparkles, description: 'Academic Database' },
  { symbol: 'Gx', name: 'Galaxy', category: 'ops', number: 6, mass: 'SYS.MON', status: 'active', icon: Activity, description: 'System Telemetry' },
  { symbol: 'Se', name: 'Sentry', category: 'security', number: 7, mass: 'SEC.GUARD', status: 'active', icon: Shield, description: 'Security Protocols' },
  { symbol: 'Nl', name: 'Nexus', category: 'logic', number: 8, mass: 'CORE.CPU', status: 'active', icon: Zap, description: 'Central Processing' },
];

export const PeriodicTable: React.FC = () => {
  const { agents } = useNeuralSync();

  // Merge live agent status with static element data
  const getAgentStatus = (name: string): 'active' | 'busy' | 'offline' => {
    const liveAgent = agents.find(a => a.name?.toLowerCase() === name.toLowerCase());
    if (!liveAgent) return 'offline';
    if (liveAgent.status === 'IDLE' || liveAgent.status === 'THINKING') return 'active';
    if (liveAgent.status === 'EXECUTING') return 'busy';
    return 'offline';
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold mb-6 text-gray-100 flex items-center gap-2">
        <span className="text-blue-500">❖</span> Periodic Table of Agents
      </h3>

      <div className="grid grid-cols-4 gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
        {ELEMENTS.map((el, index) => (
          <motion.div
            key={el.symbol}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            className={`
              relative p-3 rounded-lg border cursor-pointer group
              ${el.category === 'research' ? 'bg-cyan-900/20 border-cyan-800/50 hover:bg-cyan-900/40' : ''}
              ${el.category === 'relay' ? 'bg-pink-900/20 border-pink-800/50 hover:bg-pink-900/40' : ''}
              ${el.category === 'ops' ? 'bg-green-900/20 border-green-800/50 hover:bg-green-900/40' : ''}
              ${el.category === 'logic' ? 'bg-purple-900/20 border-purple-800/50 hover:bg-purple-900/40' : ''}
              ${el.category === 'security' ? 'bg-red-900/20 border-red-800/50 hover:bg-red-900/40' : ''}
            `}
          >
            {/* Hover Detail Card */}
            <div className="absolute hidden group-hover:block z-20 top-full left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <el.icon className="w-4 h-4 text-gray-300" />
                <span className="font-bold text-white">{el.name}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{el.description}</p>
              <div className="mt-2 text-[10px] font-mono text-gray-500">STATUS: <span className={`uppercase ${getAgentStatus(el.name) === 'active' ? 'text-green-400' : getAgentStatus(el.name) === 'busy' ? 'text-yellow-400' : 'text-gray-500'}`}>{getAgentStatus(el.name)}</span></div>
            </div>

            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-mono text-gray-500">{el.number}</span>
              <div className={`w-2 h-2 rounded-full ${getAgentStatus(el.name) === 'active' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)] animate-pulse' : getAgentStatus(el.name) === 'busy' ? 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.6)] animate-pulse' : 'bg-gray-600'}`} />
            </div>

            <div className="text-center mb-1">
              <h4 className={`text-2xl font-bold font-mono
                ${el.category === 'research' ? 'text-cyan-400' : ''}
                ${el.category === 'relay' ? 'text-pink-400' : ''}
                ${el.category === 'ops' ? 'text-green-400' : ''}
                ${el.category === 'logic' ? 'text-purple-400' : ''}
                ${el.category === 'security' ? 'text-red-400' : ''}
              `}>{el.symbol}</h4>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium truncate">{el.name}</div>
            </div>

            <div className="text-center">
              <span className="text-[9px] text-gray-600 font-mono block">{el.mass}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
