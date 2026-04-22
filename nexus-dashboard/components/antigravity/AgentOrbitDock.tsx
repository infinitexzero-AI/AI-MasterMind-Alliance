import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Code, PenTool, Search, ShieldCheck } from 'lucide-react';

export interface AgentState {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'thinking' | 'acting';
  currentAction?: string;
}

interface AgentOrbitDockProps {
  agents: AgentState[];
  onSelectAgent?: (agentId: string) => void;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  'Orchestrator': <Brain size={20} />,
  'Researcher': <Search size={20} />,
  'Coder': <Code size={20} />,
  'Writer': <PenTool size={20} />,
  'Reviewer': <ShieldCheck size={20} />,
};

export const AgentOrbitDock: React.FC<AgentOrbitDockProps> = ({ agents, onSelectAgent }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4 p-4 items-center bg-black/40 backdrop-blur-xl rounded-r-2xl border-r border-white/10 h-full w-20 hover:w-64 transition-all duration-500 group overflow-visible z-50">
      
      <div className="text-xs font-mono text-white/50 mb-4 h-6 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        ACTIVE AGENTS
      </div>

      {agents.map((agent) => (
        <div key={agent.id} className="relative w-full flex items-center">
            {/* Orb */}
            <motion.div
              layoutId={`orb-${agent.id}`}
              onClick={() => {
                  setExpandedId(expandedId === agent.id ? null : agent.id);
                  onSelectAgent?.(agent.id);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shrink-0
                border-2 transition-colors duration-300 z-20
                ${agent.status === 'acting' ? 'border-green-400 bg-green-500/20 shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 
                  agent.status === 'thinking' ? 'border-amber-400 bg-amber-500/20 animate-pulse' : 
                  'border-white/20 bg-white/5'}
              `}
            >
              <div className="text-white/80">
                {AGENT_ICONS[agent.name] || <Brain size={20} />}
              </div>
              
              {/* Spinning outer ring for active state */}
              {agent.status !== 'idle' && (
                 <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-[-4px] rounded-full border border-dashed border-white/30"
                 />
              )}
            </motion.div>

            {/* Label (Hidden by default, shown on hover/expand) */}
            <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{agent.name}</h3>
                <p className="text-[10px] text-white/60 truncate">{agent.role}</p>
                {agent.status !== 'idle' && (
                    <p className="text-[10px] text-green-400 truncate mt-1">
                        {agent.currentAction || agent.status}
                    </p>
                )}
            </div>
            
            {/* Expanded Detail View (Popover) */}
            <AnimatePresence>
                {expandedId === agent.id && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 50 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute left-full top-0 ml-4 w-64 bg-black/80 border border-white/20 rounded-xl p-4 backdrop-blur-xl shadow-2xl z-50 pointer-events-none group-hover:pointer-events-auto"
                    >
                         <h4 className="text-lg font-bold text-white mb-2">{agent.name}</h4>
                         <div className="space-y-2">
                             <div className="bg-white/5 p-2 rounded">
                                 <span className="text-[10px] uppercase text-white/40 block">CURRENT GOAL</span>
                                 <p className="text-xs text-white/90">Analyzing system performance metrics...</p>
                             </div>
                             <div className="bg-white/5 p-2 rounded">
                                 <span className="text-[10px] uppercase text-white/40 block">LAST THOUGHT</span>
                                 <p className="text-xs text-white/70 italic">"CPU usage elevated, checking process list."</p>
                             </div>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
      ))}
    </div>
  );
};
