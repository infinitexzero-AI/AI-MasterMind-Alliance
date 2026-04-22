import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';

interface BundleEvent {
    id: string;
    current: number;
    baseline: number;
    delta: number;
    bloat: boolean;
    timestamp: string;
}

export default function BundleWatcherPanel() {
    const [latestEvent, setLatestEvent] = useState<BundleEvent | null>(null);

    useEffect(() => {
        const es = new EventSource('/api/system/event-stream');
        es.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.source !== 'BundleWatcher') return;
                const payload = data.payload ? JSON.parse(data.payload) : {};
                setLatestEvent({
                    id: Math.random().toString(),
                    current: payload.current ?? 0,
                    baseline: payload.baseline ?? 0,
                    delta: payload.delta ?? 0,
                    bloat: data.message?.includes('BUNDLE_BLOAT'),
                    timestamp: new Date().toISOString()
                });
            } catch { /* ignore */ }
        };
        return () => es.close();
    }, []);

    const healthPercent = latestEvent ? Math.min(100, Math.max(0, 100 - (latestEvent.delta / 10) * 100)) : 100;

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-teal-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(20,184,166,0.1)] hover:border-teal-500/40 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="flex justify-between items-center mb-6 border-b border-teal-500/20 pb-4 relative z-10">
                <h3 className="font-mono text-teal-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <Package className="w-5 h-5" /> Bundle Watcher
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded text-[10px] font-mono text-teal-300 tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    pkg audit
                </div>
            </div>
            <div className="relative z-10 min-h-[120px]">
                {!latestEvent ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-500 bg-slate-900/40 rounded-xl border border-dashed border-slate-700">
                        <Package className="w-8 h-8 mb-3 opacity-50 text-teal-500/50" />
                        <span className="text-xs font-mono uppercase tracking-widest">Establishing baseline...</span>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Total Pkgs', value: latestEvent.current, color: 'text-teal-300' },
                                { label: 'Baseline', value: latestEvent.baseline, color: 'text-slate-300' },
                                { label: 'Delta', value: `+${latestEvent.delta}`, color: latestEvent.bloat ? 'text-amber-400' : 'text-emerald-400' },
                            ].map(stat => (
                                <div key={stat.label} className="bg-slate-900/50 rounded-lg p-3 border border-white/5 text-center">
                                    <div className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Health bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                <span>Bundle Health</span>
                                <span>{healthPercent.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${healthPercent}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${healthPercent > 70 ? 'bg-emerald-500' : healthPercent > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                />
                            </div>
                        </div>

                        {latestEvent.bloat && (
                            <div className="flex items-start gap-2 text-amber-300 text-xs font-mono p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>Bundle grew significantly. Review recent npm installs for unnecessary dependencies.</span>
                            </div>
                        )}
                        {!latestEvent.bloat && (
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <TrendingUp className="w-4 h-4" /> Bundle footprint within healthy range
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
