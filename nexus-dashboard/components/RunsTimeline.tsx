import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TelemetryRun {
  run_id: string;
  type: string;
  agent_id: string;
  timestamp: string;
  latency_ms: number;
  status: 'success' | 'error' | 'pending';
  tokens: number;
}

const RunItem: React.FC<{ run: TelemetryRun }> = ({ run }) => (
  <div className="flex gap-4 group cursor-pointer">
    <div className="flex flex-col items-center">
      <div className={`w-3 h-3 rounded-full border-2 ${run.status === 'success' ? 'border-emerald-500 bg-emerald-500/20' : 'border-red-500 bg-red-500/20'} mt-1.5`} />
      <div className="w-0.5 h-full bg-white/5 group-last:bg-transparent" />
    </div>
    <div className="flex-1 pb-6">
      <div className="bg-white/5 border border-white/5 p-3 rounded-lg hover:border-white/10 transition-colors">
        <div className="flex justify-between items-start mb-1">
          <div className="text-[11px] font-bold text-slate-200 font-mono">RUN::{run.run_id.slice(0, 8)}</div>
          <div className="text-[9px] font-mono text-slate-500">{new Date(run.timestamp).toLocaleTimeString()}</div>
        </div>
        <div className="flex gap-3 text-[10px] font-mono">
          <span className="text-cyan-400">@{run.agent_id}</span>
          <span className="text-slate-500 text-[8px] uppercase">{run.type.replace('_', ' ')}</span>
          <span className="text-slate-400 ml-auto">{run.latency_ms}ms | {run.tokens} tokens</span>
        </div>
      </div>
    </div>
  </div>
);

export const RunsTimeline: React.FC<{ runs: TelemetryRun[] }> = ({ runs }) => {
  return (
    <div className="bg-slate-900/20 backdrop-blur-xl border border-white/5 p-6 rounded-2xl">
      <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Activity Timeline</h3>
      <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {runs.map((run, i) => (
            <motion.div
              key={run.run_id + i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <RunItem run={run} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
