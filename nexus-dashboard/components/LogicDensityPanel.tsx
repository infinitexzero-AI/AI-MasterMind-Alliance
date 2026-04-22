import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart4, Flame, CheckCircle2 } from 'lucide-react';

interface FileComplexity {
    file: string;
    complexity: number;
    lines: number;
    riskLevel: 'Low' | 'Medium' | 'High';
}

export default function LogicDensityPanel() {
    const [files, setFiles] = useState<FileComplexity[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastScanned, setLastScanned] = useState<string | null>(null);

    const runScan = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/bug-prediction/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetPath: 'pages/api' })
            });
            if (!res.ok) return;
            const data = await res.json();
            // Sort by complexity descending, take top 12
            setFiles((data.results ?? []).slice(0, 12));
            setLastScanned(new Date().toLocaleTimeString());
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        runScan();
        const interval = setInterval(runScan, 60000 * 5); // Every 5 minutes
        return () => clearInterval(interval);
    }, [runScan]);

    const maxComplexity = Math.max(...files.map(f => f.complexity), 1);

    const riskColor = (risk: string) => {
        if (risk === 'High') return 'from-red-500 to-rose-600';
        if (risk === 'Medium') return 'from-amber-500 to-orange-500';
        return 'from-emerald-500 to-teal-500';
    };

    const riskBadge = (risk: string) => {
        if (risk === 'High') return 'bg-red-500/20 text-red-300 border-red-500/30';
        if (risk === 'Medium') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    };

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-pink-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(236,72,153,0.1)] hover:border-pink-500/40 transition-all col-span-2">
            <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />

            <div className="flex justify-between items-center mb-5 border-b border-pink-500/20 pb-4 relative z-10">
                <h3 className="font-mono text-pink-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <Flame className="w-5 h-5" /> Logic Density Heatmap
                </h3>
                <div className="flex items-center gap-3">
                    {lastScanned && <span className="text-[10px] font-mono text-slate-500">Last scan: {lastScanned}</span>}
                    <button
                        onClick={runScan}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/30 rounded text-[10px] font-mono text-pink-300 tracking-widest uppercase hover:bg-pink-500/20 transition-all disabled:opacity-50"
                    >
                        <BarChart4 className="w-3 h-3" /> {loading ? 'Scanning...' : 'Re-scan'}
                    </button>
                </div>
            </div>

            {files.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-slate-500 font-mono text-xs">
                    <Flame className="w-10 h-10 mb-3 opacity-30 text-pink-500" />
                    {loading ? 'Analyzing codebase complexity...' : 'No data yet. Run a scan above.'}
                </div>
            ) : (
                <div className="space-y-2 relative z-10">
                    {files.map((file, i) => {
                        const barPercent = (file.complexity / maxComplexity) * 100;
                        return (
                            <motion.div
                                key={file.file}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-3 group/row"
                            >
                                {/* File name */}
                                <div className="w-48 shrink-0">
                                    <span className="text-[11px] font-mono text-slate-300 truncate block group-hover/row:text-white transition-colors">
                                        {file.file.split('/').pop()}
                                    </span>
                                    <span className="text-[9px] text-slate-600 font-mono">{file.lines} lines</span>
                                </div>

                                {/* Complexity bar */}
                                <div className="flex-1 h-5 bg-slate-800/60 rounded-full overflow-hidden relative">
                                    <motion.div
                                        className={`h-full rounded-full bg-gradient-to-r ${riskColor(file.riskLevel)}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.max(barPercent, 2)}%` }}
                                        transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.05 }}
                                    />
                                </div>

                                {/* Score + badge */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[11px] font-mono text-slate-300 w-8 text-right">{file.complexity}</span>
                                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider ${riskBadge(file.riskLevel)}`}>
                                        {file.riskLevel}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {files.length > 0 && files.filter(f => f.riskLevel === 'Low').length === files.length && (
                <div className="flex items-center gap-2 mt-4 text-emerald-400 text-[11px] font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All scanned files within healthy complexity range
                </div>
            )}
        </div>
    );
}
