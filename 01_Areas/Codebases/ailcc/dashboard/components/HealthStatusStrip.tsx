import React from 'react';

interface HealthItemProps {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
}

const HealthItem: React.FC<HealthItemProps> = ({ name, status, latency }) => {
  const color = status === 'healthy' ? 'bg-emerald-400' : status === 'degraded' ? 'bg-amber-400' : 'bg-red-500';
  const shadow = status === 'healthy' ? 'shadow-[0_0_8px_rgba(52,211,153,0.5)]' : status === 'degraded' ? 'shadow-[0_0_8px_rgba(251,191,36,0.3)]' : 'shadow-[0_0_8px_rgba(239,68,68,0.3)]';

  return (
    <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
      <div className={`w-2 h-2 rounded-full ${color} ${shadow} ${status === 'healthy' ? 'animate-pulse' : ''}`} />
      <div className="flex flex-col">
        <span className="text-[10px] font-mono text-slate-300 uppercase tracking-tighter">{name}</span>
        {latency && <span className="text-[9px] font-mono text-slate-500">{latency}ms Uplink</span>}
      </div>
    </div>
  );
};

export const HealthStatusStrip: React.FC<{ health: any }> = ({ health }) => {
  return (
    <div className="flex flex-wrap gap-3">
      <HealthItem name="Neural Relay" status={health?.relay || 'healthy'} latency={12} />
      <HealthItem name="Valentine Core" status={health?.core || 'healthy'} />
      <HealthItem name="Antigravity Bridge" status={health?.bridge || 'healthy'} />
      <HealthItem name="Matrix Substrate" status="healthy" latency={4} />
    </div>
  );
};
