import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Trash2, CheckCircle2 } from 'lucide-react';

interface CSSAuditEvent {
    id: string;
    unusedVars: string[];
    totalCount: number;
    usedCount: number;
    timestamp: string;
    clean: boolean;
}

export default function CSSOptimizerPanel() {
    const [latestAudit, setLatestAudit] = useState<CSSAuditEvent | null>(null);

    useEffect(() => {
        const es = new EventSource('/api/system/event-stream');
        es.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.source !== 'CSSOptimizer') return;
                const payload = data.payload ? JSON.parse(data.payload) : {};
                setLatestAudit({
                    id: Math.random().toString(),
                    unusedVars: payload.unusedVars ?? [],
                    totalCount: payload.totalCount ?? 0,
                    usedCount: payload.usedCount ?? payload.totalCount ?? 0,
                    timestamp: new Date().toISOString(),
                    clean: data.message?.includes('CSS_CLEAN')
                });
            } catch { /* ignore */ }
        };
        return () => es.close();
    }, []);

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:border-amber-500/40 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="flex justify-between items-center mb-6 border-b border-amber-500/20 pb-4 relative z-10">
                <h3 className="font-mono text-amber-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <Palette className="w-5 h-5" /> CSS Optimizer
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-[10px] font-mono text-amber-300 tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Token Auditor
                </div>
            </div>
            <div className="relative z-10 min-h-[120px]">
                {!latestAudit ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-500 bg-slate-900/40 rounded-xl border border-dashed border-slate-700">
                        <Palette className="w-8 h-8 mb-3 opacity-50 text-amber-500/50" />
                        <span className="text-xs font-mono uppercase tracking-widest">Awaiting CSS audit pass...</span>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Total', value: latestAudit.totalCount, color: 'text-slate-300' },
                                { label: 'Used', value: latestAudit.usedCount, color: 'text-emerald-400' },
                                { label: 'Dead', value: latestAudit.unusedVars.length, color: latestAudit.unusedVars.length > 0 ? 'text-amber-400' : 'text-slate-500' },
                            ].map(stat => (
                                <div key={stat.label} className="bg-slate-900/50 rounded-lg p-3 border border-white/5 text-center">
                                    <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                        {latestAudit.clean ? (
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <CheckCircle2 className="w-4 h-4" /> All CSS variables actively referenced
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-[10px] text-amber-400 uppercase font-mono tracking-widest flex items-center gap-2"><Trash2 className="w-3 h-3" /> Dead Tokens</p>
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-amber-500/20 max-h-24 overflow-y-auto">
                                    {latestAudit.unusedVars.map(v => (
                                        <div key={v} className="text-[11px] text-amber-300 font-mono">{v}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
