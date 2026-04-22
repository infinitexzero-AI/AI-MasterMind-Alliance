"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Smartphone, Terminal, User, Monitor } from 'lucide-react';

import { useSwarmTelemetry } from '../../../hooks/useSwarmTelemetry';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
  efficiency?: number; // 0-100%
}

export const TaskQueue: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const { actionPlan } = useSwarmTelemetry();

  // Phase 72: Dynamic Engine Connectivity
  React.useEffect(() => {
     if (actionPlan && actionPlan.steps) {
         const plan = actionPlan;
         
         // Convert incoming schema to local Task array
         const newTasks: Task[] = plan.steps.map((s: any) => ({
             id: plan.id + "_" + s.id,
             title: s.title,
             status: s.status,
             priority: 'high',
             assignedTo: plan.title.includes("Agency") ? "Coder" : 
                         plan.title.includes("Scholar") ? "Mika" : 
                         plan.title.includes("Researcher") ? "Grok" : "System"
         }));
         
         setTasks(prev => {
            // Filter out old tasks from this specific plan ID so we replace them with the fresh ones
            const preserved = prev.filter(t => !t.id.startsWith(plan.id + "_"));
            // Put active steps at top
            return [...newTasks, ...preserved].slice(0, 15); 
         });
     }
  }, [actionPlan]);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'active') return t.status === 'in_progress';
    if (filter === 'completed') return t.status === 'completed';
    return t.status === 'pending';
  });

  const handleAssign = (taskId: string, agent: Task['assignedTo']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignedTo: agent } : t));
  };

  const getAgentIcon = (agent?: string) => {
    switch (agent) {
      case 'Comet': return <Globe className="w-3 h-3 text-cyan-400" />;
      case 'Valentine': return <Smartphone className="w-3 h-3 text-pink-400" />;
      case 'Mika':
      case 'Grok': return <Smartphone className="w-3 h-3 text-orange-400" />;
      case 'Coder': return <Terminal className="w-3 h-3 text-green-400" />;
      case 'System': return <Monitor className="w-3 h-3 text-purple-400" />;
      default: return <User className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className="glass-card p-4 h-[400px] flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Task Queue</h3>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded transition-colors ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded transition-colors ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Pending
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-700">
        {filteredTasks.map((task) => (
          <motion.div
            layout
            key={task.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-3 rounded-lg border flex justify-between items-center transition-all duration-300 group/card relative backdrop-blur-md
              ${task.status === 'in_progress' ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-slate-800/30 border-white/5 hover:bg-slate-800/50 hover:border-cyan-500/30'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`w-1 h-8 rounded-full ${task.priority === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
              <div>
                <div className="text-sm font-medium text-gray-200">{task.title}</div>
                <div className="flex items-center gap-2 mt-1">

                  {/* AGENT POPOVER TRIGGER */}
                  <div className="relative group/popover">
                    <button className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-gray-900/50 border border-gray-700/50 hover:bg-gray-700 transition-colors">
                      {getAgentIcon(task.assignedTo)}
                      <span className="text-[10px] text-gray-400">{task.assignedTo || 'Unassigned'}</span>
                    </button>

                    {/* MINI AGENT SELECTOR */}
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover/popover:flex flex-col bg-gray-800 border border-gray-700 rounded shadow-xl z-50 p-1 min-w-[100px]">
                      {(['Comet', 'Valentine', 'Mika', 'Coder', 'System'] as const).map(agent => (
                        <button
                          key={agent}
                          onClick={() => handleAssign(task.id, agent)}
                          className="text-[10px] text-left px-2 py-1 hover:bg-gray-700 rounded text-gray-300 flex items-center gap-2"
                        >
                          {getAgentIcon(agent)} {agent}
                        </button>
                      ))}
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">• {task.status.replace('_', ' ')}</span>
                  {task.efficiency && (
                    <span className="text-[10px] text-emerald-400 opacity-80 tracking-wider">• {task.efficiency}% {task.efficiency > 90 ? 'OPTIMAL' : 'EFF.'}</span>
                  )}
                </div>
              </div>
            </div>
            {task.status === 'in_progress' && (
              <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            )}
            {task.status === 'completed' && (
              <span className="text-green-500 font-bold">✓</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
