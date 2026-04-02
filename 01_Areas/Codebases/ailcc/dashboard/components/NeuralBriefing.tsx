import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, CheckCircle, Activity } from 'lucide-react';

export default function NeuralBriefing() {
  const [briefing, setBriefing] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/system/briefing-stream');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'HEARTBEAT') return; // Filter noise
      
      setBriefing(data);
      setLogs(prev => [data, ...prev].slice(0, 5));
    };

    return () => eventSource.close();
  }, []);

  if (!briefing) return null;

  return (
    <div className="p-4 bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-500/80">Neural Briefing</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase">Live Pulse</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={briefing.timestamp || briefing.type}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-3"
        >
          {briefing.type === 'BRIEFING_START' && (
            <p className="text-sm text-slate-300 font-medium italic">"{briefing.message}"</p>
          )}

          {briefing.type === 'ACCOMPLISHMENTS' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded border border-cyan-500/20 w-fit">
                <CheckCircle className="w-3 h-3" />
                <span>{briefing.count} MISSION OBJECTIVES ACHIEVED</span>
              </div>
              <ul className="space-y-1">
                {briefing.recent.map((task: string, i: number) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-cyan-500/50 mt-1">•</span>
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-emerald-400" />
          <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
               className="h-full bg-emerald-500"
               animate={{ width: `${Math.random() * 40 + 60}%` }}
               transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            />
          </div>
        </div>
        <button className="text-[10px] font-mono text-cyan-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">
          Full Protocol
        </button>
      </div>
    </div>
  );
}
