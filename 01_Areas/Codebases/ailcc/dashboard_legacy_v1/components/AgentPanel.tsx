import React from 'react';
import { useAgentStatus, AgentView } from './hooks/useAgentStatus';

export default function AgentPanel() {
  const { agents, loading, error } = useAgentStatus();

  if (loading) return (
    <div className="glass-panel p-6 rounded-xl animate-pulse">
       <div className="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-lg border border-white/5"></div>)}
       </div>
    </div>
  );

  if (error) return (
    <div className="glass-panel p-6 rounded-xl border-red-500/30 text-red-400">
      <h3 className="font-bold flex items-center gap-2">⚠️ Telemetry Lost</h3>
      <p className="text-sm opacity-80 mt-1">Forge Monitor unreachable.</p>
    </div>
  );

  return (
    <section className="glass-panel p-6 rounded-xl">
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Agent Grid
        </h2>
        <span className="text-[10px] font-mono text-blue-300 bg-blue-900/30 px-2 py-1 rounded border border-blue-500/30">
          LIVE TELEMETRY
        </span>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
      </div>
    </section>
  );
}

function AgentCard({ agent }: { agent: AgentView }) {
  const statusColor = {
    ok: 'border-green-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    warn: 'border-yellow-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    error: 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
  }[agent.status];

  const dotColor = { ok: 'bg-green-500', warn: 'bg-yellow-500', error: 'bg-red-500' }[agent.status];

  return (
    <div className={`glass-card p-5 rounded-xl border ${statusColor} relative overflow-hidden group`}>
      {/* Background Pulse Effect on Status */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${dotColor.replace('bg-', '')}/10 blur-[40px] rounded-full -mr-16 -mt-16 transition-all group-hover:bg-${dotColor.replace('bg-', '')}/20`}></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="font-bold text-lg capitalize text-white tracking-wide">{agent.name}</h3>
          <p className="text-xs text-blue-300 font-medium">{agent.role}</p>
        </div>
        <div className={`w-2 h-2 rounded-full ${dotColor} shadow-[0_0_10px_currentColor] animate-pulse`}></div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center gap-2 font-medium text-sm text-slate-200">
            {agent.availability === 'busy' ? (
              <span className="flex items-center gap-2 text-blue-400">
                <IconSpinner /> Processing
              </span>
            ) : (
              <span className="text-slate-400">Idle / Ready</span>
            )}
          </div>
        </div>

        {agent.currentTask && (
          <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5">
             <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Active Task</p>
             <p className="font-mono text-xs text-emerald-400 truncate" title={agent.currentTask}>
               {agent.currentTask}
             </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-white/5">
          <div>
            <span className="block font-bold text-white text-lg">{agent.successCount}</span>
            <span className="text-slate-500">Completed</span>
          </div>
          <div className="text-right">
             <span className="block font-bold text-white text-lg">{agent.uptime}s</span>
             <span className="text-slate-500">Uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSpinner() {
  return (
    <svg className="animate-spin h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
