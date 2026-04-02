import React from 'react';
import { TelemetryChartsProps } from '../types/DashboardInterfaces';
import { Activity, DollarSign, Zap, MousePointer2, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const TelemetryChartsBase: React.FC<TelemetryChartsProps> = ({
    fps,
    latencyMs,
    totalCost,
    dailyBudget,
    gateStatus
}) => {

    // Derived Metrics
    const costPercent = Math.min((totalCost / dailyBudget) * 100, 100);
    const isOverBudget = totalCost > dailyBudget;

    // Latency Color
    const getLatencyColor = (ms: number) => {
        if (ms < 100) return 'text-emerald-400';
        if (ms < 300) return 'text-amber-400';
        return 'text-red-400';
    };

    return (
        <div className="renaissance-panel p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl flex flex-col gap-6 overflow-hidden relative">
            {/* Header */}
            <header className="flex justify-between items-center border-b border-slate-800 pb-3 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-amber-500/20 border border-amber-500/50">
                        <Activity className="text-amber-400" size={18} />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-sm uppercase tracking-widest whitespace-nowrap">System Telemetry</h2>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">Real-time Performance Node</p>
                    </div>
                </div>
            </header>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-black/40 p-4 rounded-lg border border-slate-800/50 flex flex-col gap-1 group"
                >
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-mono group-hover:text-emerald-400 transition-colors">
                        <Cpu size={12} /> Render FPS
                    </div>
                    <div className="text-2xl font-mono text-emerald-400 tracking-tighter shadow-emerald-500/20 drop-shadow-md">
                        {fps.toString().padStart(2, '0')}
                    </div>
                </motion.div>
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-black/40 p-4 rounded-lg border border-slate-800/50 flex flex-col gap-1 group"
                >
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-mono group-hover:text-amber-400 transition-colors">
                        <MousePointer2 size={12} /> Sync Latency
                    </div>
                    <div className={`text-2xl font-mono tracking-tighter drop-shadow-md ${getLatencyColor(latencyMs)}`}>
                        {latencyMs}ms
                    </div>
                </motion.div>
            </div>

            {/* Budget Monitor */}
            <div className="bg-black/40 p-4 rounded-lg border border-slate-800/50 relative z-10 group overflow-hidden">
                <div className="flex justify-between items-end mb-3">
                    <div className="flex flex-col">
                        <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                            <DollarSign size={12} /> Resource Consumption
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase">Cumulative Agent Spend</div>
                    </div>
                    <div className={`font-mono text-lg flex items-baseline gap-1 ${isOverBudget ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                        <span className="text-xs opacity-50">$</span>
                        {totalCost.toFixed(4)}
                        <span className="text-[10px] text-slate-400 font-normal"> / ${dailyBudget.toFixed(2)}</span>
                    </div>
                </div>
                {/* Progress Bar Container */}
                <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${costPercent}%` }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className={`h-full relative ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}
                    >
                        {/* Glow effect on progress bar */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </motion.div>
                </div>
            </div>

            {/* Logic Gates Status */}
            <div className="flex-1 space-y-3 relative z-10">
                <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1 border-b border-slate-800 pb-2">
                    <Zap size={12} className="text-cyan-400" /> Operational Gates
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(gateStatus).map(([gate, active]) => (
                        <div key={gate} className="bg-white/5 p-2 rounded border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors">
                            <span className="text-[9px] text-slate-400 uppercase font-mono tracking-tight group-hover:text-slate-200 transition-colors">{gate}</span>
                            <div className={`flex items-center gap-2 ${active ? 'text-cyan-400' : 'text-slate-400'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-700'}`} />
                                <span className="text-[8px] font-bold uppercase">{active ? 'Live' : 'Off'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background Texture Detail */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />
        </div>
    );
};

export const TelemetryCharts = React.memo(TelemetryChartsBase);
TelemetryCharts.displayName = 'TelemetryCharts';
