import React from 'react';
import useSWR from 'swr';
import { Laptop, Smartphone, Brain, Activity, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  context?: string;
  source: 'touchbar' | 'ios_shortcut' | 'grok' | 'dashboard';
  priority?: 'high' | 'normal' | 'low';
  status: 'pending' | 'active' | 'completed';
  timestamp: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TaskLog() {
  const { data, error } = useSWR('/api/tasks', fetcher, { refreshInterval: 2000 });

  const tasks: Task[] = data?.data || [];
  const isLoading = !data && !error;

  const getIcon = (source: string) => {
    switch (source) {
      case 'touchbar': return <Laptop className="w-4 h-4 text-cyan-400" />;
      case 'ios_shortcut': return <Smartphone className="w-4 h-4 text-indigo-400" />;
      case 'grok': return <Brain className="w-4 h-4 text-emerald-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPriorityColor = (p: string = 'normal') => {
    switch (p) {
      case 'high': return 'border-l-rose-500 bg-rose-500/10';
      case 'low': return 'border-l-slate-500 bg-slate-500/5';
      default: return 'border-l-indigo-500 bg-indigo-500/10';
    }
  };

  return (
    <div className="w-full h-full flex flex-col font-mono text-sm relative overflow-hidden backdrop-blur-md bg-slate-900/50 rounded-xl border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10 z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
          <h2 className="font-bold text-slate-200 tracking-wider">COMMAND_CONSOLE</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          LIVE
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {isLoading && <div className="text-center py-10 text-slate-400">Initializing Uplink...</div>}
        
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              layout
              className={`relative group flex flex-col p-3 rounded-r-lg border-l-4 ${getPriorityColor(task.priority)} bg-slate-800/40 hover:bg-slate-700/50 transition-colors border border-white/5`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {getIcon(task.source)}
                  <span className="font-semibold text-slate-200">{task.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(task.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              {task.context && (
                <p className="text-xs text-slate-400 ml-6 line-clamp-2">{task.context}</p>
              )}
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${task.status === 'pending' ? 'border-yellow-500/50 text-yellow-500' : 'border-emerald-500/50 text-emerald-500'}`}>
                    {task.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {tasks.length === 0 && !isLoading && (
            <div className="text-center py-10 opacity-30 text-xs uppercase tracking-widest">
                No active signals
            </div>
        )}
      </div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-scanline opacity-[0.03] z-20" />
    </div>
  );
}
