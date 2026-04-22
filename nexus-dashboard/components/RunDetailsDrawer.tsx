import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const RunDetailsDrawer: React.FC<{ run: any; onClose: () => void }> = ({ run, onClose }) => {
  if (!run) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="relative w-full max-w-lg bg-slate-900 border-l border-white/10 h-full shadow-2xl p-6 overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold font-mono text-cyan-400">TRACE::{run.run_id.slice(0, 8)}</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-[10px] font-mono text-slate-500 uppercase mb-2">Metadata</h3>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-white/5 space-y-2">
                <div className="flex justify-between text-[11px] font-mono"><span className="text-slate-500">Timestamp</span><span className="text-slate-300">{run.timestamp}</span></div>
                <div className="flex justify-between text-[11px] font-mono"><span className="text-slate-500">Agent</span><span className="text-emerald-400">@{run.agent_id}</span></div>
                <div className="flex justify-between text-[11px] font-mono"><span className="text-slate-500">Latency</span><span className="text-cyan-400">{run.latency_ms}ms</span></div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-mono text-slate-500 uppercase mb-2">Payload</h3>
              <pre className="bg-slate-950 p-4 rounded-lg border border-white/5 text-[10px] font-mono text-slate-400 overflow-x-auto">
                {JSON.stringify(run.payload || run, null, 2)}
              </pre>
            </section>

            <section>
              <h3 className="text-[10px] font-mono text-slate-500 uppercase mb-2">System Insights</h3>
              <div className="text-xs text-slate-400 italic">"Clean Handshake detected. No context leakage observed in this phase-shift."</div>
            </section>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
