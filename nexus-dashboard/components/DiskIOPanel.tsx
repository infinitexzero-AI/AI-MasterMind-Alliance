import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, TrendingUp } from 'lucide-react';

interface DiskSnapshot {
    timestamp: string;
    totalMBps: number;
    disks: Array<{ device: string; mbPerSec: number; transfersPerSec: number }>;
}

const MAX_HISTORY = 30;

export default function DiskIOPanel() {
    const [history, setHistory] = useState<number[]>([]);
    const [latest, setLatest] = useState<DiskSnapshot | null>(null);
    const [peak, setPeak] = useState(0);

    const fetchIO = useCallback(async () => {
        try {
            const res = await fetch('/api/system/disk-io');
            if (!res.ok) return;
            const data: DiskSnapshot = await res.json();
            setLatest(data);
            setHistory(prev => {
                const next = [...prev, data.totalMBps].slice(-MAX_HISTORY);
                setPeak(p => Math.max(p, data.totalMBps));
                return next;
            });
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        fetchIO();
        const interval = setInterval(fetchIO, 3000);
        return () => clearInterval(interval);
    }, [fetchIO]);

    const maxVal = Math.max(peak, 0.1);
    const barWidth = 100 / MAX_HISTORY;

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(249,115,22,0.1)] hover:border-orange-500/40 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />

            <div className="flex justify-between items-center mb-5 border-b border-orange-500/20 pb-4 relative z-10">
                <h3 className="font-mono text-orange-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <HardDrive className="w-5 h-5" /> Disk I/O
                </h3>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-400">peak <span className="text-orange-300">{peak.toFixed(2)} MB/s</span></span>
                    <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-[10px] font-mono text-orange-300 tracking-widest uppercase">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Live
                    </div>
                </div>
            </div>

            {/* Live bar chart */}
            <div className="relative h-20 bg-slate-900/60 rounded-xl border border-white/5 overflow-hidden mb-4">
                <div className="absolute inset-0 flex items-end gap-px px-1 pb-1">
                    {history.map((val, i) => (
                        <motion.div
                            key={i}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            style={{
                                width: `${barWidth}%`,
                                height: `${Math.max(2, (val / maxVal) * 100)}%`,
                                backgroundColor: val > maxVal * 0.7 ? '#f97316' : val > maxVal * 0.4 ? '#fb923c' : '#fbbf24'
                            }}
                            className="rounded-sm origin-bottom opacity-80 flex-shrink-0"
                        />
                    ))}
                </div>
                <div className="absolute top-1 left-2 text-[9px] font-mono text-slate-500 uppercase tracking-widest">I/O activity (30s)</div>
            </div>

            {/* Disk breakdown */}
            <div className="space-y-2 relative z-10">
                {latest?.disks.map(disk => (
                    <div key={disk.device} className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-lg border border-white/5">
                        <span className="text-xs font-mono text-slate-300 flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 text-orange-400" /> {disk.device}
                        </span>
                        <div className="flex gap-4 text-[11px] font-mono">
                            <span className="text-orange-300">{disk.mbPerSec.toFixed(2)} MB/s</span>
                            <span className="text-slate-500">{disk.transfersPerSec.toFixed(0)} t/s</span>
                        </div>
                    </div>
                ))}
                {!latest && (
                    <div className="text-center text-slate-500 text-xs font-mono py-4">Sampling disk I/O...</div>
                )}
            </div>
        </div>
    );
}
