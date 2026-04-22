import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MemoryStick, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MemSnapshot {
    timestamp: string;
    system: { totalMB: number; usedMB: number; freeMB: number; usedPercent: number };
    process: { heapUsedMB: number; heapTotalMB: number; rssMB: number };
}

const MAX_HISTORY = 40;
const LEAK_THRESHOLD_CLIMB = 50; // MB climb over 40 samples = potential leak

export default function MemoryLeakPanel() {
    const [history, setHistory] = useState<MemSnapshot[]>([]);
    const [leakWarning, setLeakWarning] = useState(false);

    const fetchMem = useCallback(async () => {
        try {
            const res = await fetch('/api/system/memory-trend');
            if (!res.ok) return;
            const data: MemSnapshot = await res.json();
            setHistory(prev => {
                const next = [...prev, data].slice(-MAX_HISTORY);

                // Detect potential leak: process heap grew by THRESHOLD over full window
                if (next.length >= 10) {
                    const first = next[0].process.heapUsedMB;
                    const last = next[next.length - 1].process.heapUsedMB;
                    setLeakWarning(last - first > LEAK_THRESHOLD_CLIMB);
                }
                return next;
            });
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        fetchMem();
        const interval = setInterval(fetchMem, 8000);
        return () => clearInterval(interval);
    }, [fetchMem]);

    const latest = history[history.length - 1];
    const maxHeap = Math.max(...history.map(h => h.process.heapUsedMB), 1);
    const barWidth = 100 / MAX_HISTORY;

    return (
        <div className={`renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl rounded-2xl relative overflow-hidden group transition-all ${leakWarning
                ? 'border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
                : 'border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:border-indigo-500/40'
            }`}>
            <div className="absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none bg-indigo-500/5" />

            <div className="flex justify-between items-center mb-5 border-b border-indigo-500/20 pb-4 relative z-10">
                <h3 className="font-mono text-indigo-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <MemoryStick className="w-5 h-5" /> Memory Leak Detector
                </h3>
                {leakWarning ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/40 rounded text-[10px] font-mono text-red-300 tracking-widest uppercase animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Leak Suspected
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded text-[10px] font-mono text-indigo-300 tracking-widest uppercase">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> Monitoring
                    </div>
                )}
            </div>

            {/* Heap sparkline */}
            <div className="relative h-20 bg-slate-900/60 rounded-xl border border-white/5 overflow-hidden mb-4">
                <div className="absolute inset-0 flex items-end gap-px px-1 pb-1">
                    {history.map((snap, i) => {
                        const h = Math.max(2, (snap.process.heapUsedMB / maxHeap) * 100);
                        return (
                            <motion.div
                                key={i}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                style={{
                                    width: `${barWidth}%`,
                                    height: `${h}%`,
                                    backgroundColor: leakWarning ? '#ef4444' : '#818cf8'
                                }}
                                className="rounded-sm origin-bottom opacity-80 flex-shrink-0"
                            />
                        );
                    })}
                </div>
                <div className="absolute top-1 left-2 text-[9px] font-mono text-slate-500 uppercase tracking-widest">Heap used over time</div>
            </div>

            {/* Memory stats grid */}
            {latest ? (
                <div className="grid grid-cols-2 gap-3 relative z-10">
                    {[
                        { label: 'Sys Used', value: `${latest.system.usedMB} MB`, sub: `${latest.system.usedPercent}%`, color: 'text-indigo-300' },
                        { label: 'Sys Free', value: `${latest.system.freeMB} MB`, sub: `of ${latest.system.totalMB} MB`, color: 'text-slate-300' },
                        { label: 'Heap Used', value: `${latest.process.heapUsedMB} MB`, sub: `of ${latest.process.heapTotalMB} MB`, color: leakWarning ? 'text-red-400' : 'text-emerald-400' },
                        { label: 'RSS', value: `${latest.process.rssMB} MB`, sub: 'process total', color: 'text-slate-300' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-slate-900/50 rounded-lg p-3 border border-white/5">
                            <div className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{stat.label} <span className="text-slate-600">· {stat.sub}</span></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-slate-500 text-xs font-mono py-4">Sampling memory...</div>
            )}

            {!leakWarning && latest && (
                <div className="flex items-center gap-2 mt-3 text-emerald-400 text-[11px] font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> No memory leak pattern detected
                </div>
            )}
        </div>
    );
}
