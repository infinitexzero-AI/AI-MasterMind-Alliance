import React from 'react';

export const StatusPill: React.FC<{ 
  status: 'online' | 'offline' | 'degraded' | 'active' | 'idle' | 'failed' | 'queued' | 'completed' | 'critical', 
  label: string 
}> = ({ status, label }) => {
  const styles = {
    online: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    active: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]',
    queued: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    degraded: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    offline: 'bg-slate-800/50 text-slate-500 border border-slate-700/50',
    idle: 'bg-slate-700/20 text-slate-400 border border-slate-600/50',
    failed: 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
    critical: 'bg-rose-600 border border-rose-400 text-white font-bold animate-[pulse_1s_ease-in-out_infinite]',
  };

  const dotColors = {
    online: 'bg-emerald-400',
    completed: 'bg-emerald-400',
    active: 'bg-cyan-400',
    queued: 'bg-purple-400',
    degraded: 'bg-amber-400',
    offline: 'bg-slate-600',
    idle: 'bg-slate-500',
    failed: 'bg-rose-400',
    critical: 'bg-white',
  };

  const needsPulse = ['online', 'active', 'critical'].includes(status);

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full ${styles[status]}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${dotColors[status]} ${needsPulse ? 'animate-pulse' : ''}`} />
      <span className="font-mono text-[9px] tracking-widest uppercase truncate max-w-[120px]">
        {label}
      </span>
    </div>
  );
};
