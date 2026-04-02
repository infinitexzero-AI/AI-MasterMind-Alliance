import React from 'react';
import { motion } from 'framer-motion';

interface KPIProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  unit?: string;
  color: string;
}

const KPICard: React.FC<KPIProps> = ({ label, value, trend, unit, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl flex flex-col justify-between hover:border-white/10 transition-colors shadow-inner"
  >
    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">{label}</div>
    <div className="flex items-baseline gap-1">
      <div className={`text-2xl font-bold tracking-tight ${color}`}>{value}</div>
      {unit && <div className="text-xs text-slate-500 font-mono">{unit}</div>}
    </div>
    {trend && (
      <div className={`text-[10px] mt-2 font-mono ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-500'}`}>
        {trend === 'up' ? '▲ POSITIVE' : trend === 'down' ? '▼ CRITICAL' : '● STABLE'}
      </div>
    )}
  </motion.div>
);

export const KPIBar: React.FC<{ metrics: any }> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard label="Avg Latency" value={metrics?.avgLatency || 0} unit="ms" color="text-cyan-400" trend="stable" />
      <KPICard label="Success Rate" value={metrics?.successRate || 100} unit="%" color="text-emerald-400" trend="up" />
      <KPICard label="Token Throughput" value={metrics?.throughput || 0} unit="tk/s" color="text-purple-400" trend="up" />
      <KPICard label="Error Density" value={metrics?.errorDensity || 0} unit="%" color="text-orange-400" trend="stable" />
    </div>
  );
};
