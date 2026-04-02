import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ScrollText, RefreshCw } from 'lucide-react';

interface AuditEntry {
    seq: number;
    timestamp: string;
    agentId?: string;
    action: string;
    source: string;
    details: string;
    hash: string;
    prevHash: string;
}

export default function AuditLogPanel() {
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [chainValid, setChainValid] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchLog = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/system/audit-log?limit=15');
            if (!res.ok) return;
            const data = await res.json();
            setEntries(data.entries ?? []);
            setChainValid(data.chainValid ?? true);
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLog();
        const interval = setInterval(fetchLog, 15000);
        return () => clearInterval(interval);
    }, [fetchLog]);

    const severityColor = (action: string) => {
        if (action.includes('ERROR') || action.includes('VIOLATION')) return 'text-red-400 border-red-500/30 bg-red-500/5';
        if (action.includes('WARN') || action.includes('BLOAT')) return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
    };

    return (
        <div className={`renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl rounded-2xl relative overflow-hidden group transition-all col-span-2 ${!chainValid
            ? 'border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
            : 'border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] hover:border-cyan-500/40'
            }`}>
            <div className="absolute top-0 right-0 w-96 h-64 bg-cyan-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />

            <div className="flex justify-between items-center mb-5 border-b border-cyan-500/20 pb-4 relative z-10">
                <h3 className="font-mono text-cyan-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <ScrollText className="w-5 h-5" /> Tamper-Evident Audit Log
                </h3>
                <div className="flex items-center gap-3">
                    {chainValid ? (
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-mono">
                            <ShieldCheck className="w-3.5 h-3.5" /> Chain Valid
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-red-400 text-[10px] font-mono animate-pulse">
                            <ShieldAlert className="w-3.5 h-3.5" /> CHAIN TAMPERED
                        </div>
                    )}
                    <button
                        onClick={fetchLog}
                        disabled={loading}
                        title="Refresh audit log"
                        className="p-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="relative z-10 space-y-1.5 max-h-64 overflow-y-auto pr-1">
                <AnimatePresence>
                    {entries.length === 0 ? (
                        <div className="flex flex-col items-center py-8 text-slate-500 font-mono text-xs">
                            <ScrollText className="w-8 h-8 mb-3 opacity-30 text-cyan-500" />
                            No audit entries recorded yet
                        </div>
                    ) : [...entries].reverse().map((entry, i) => (
                        <motion.div
                            key={`${entry.seq}-${i}`}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className={`p-2.5 rounded-lg border text-[11px] font-mono flex items-start gap-3 ${severityColor(entry.action)}`}
                        >
                            <span className="text-slate-600 shrink-0 w-6 text-right">#{entry.seq}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <span className="font-bold truncate">{entry.action}</span>
                                    <span className="text-slate-500 ml-2 shrink-0 text-[9px]">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="text-slate-500 truncate">{entry.source}{entry.agentId ? ` · ${entry.agentId}` : ''}</div>
                                {entry.details && <p className="text-slate-400 mt-1 line-clamp-1">{entry.details}</p>}
                            </div>
                            <span className="text-[9px] text-slate-700 font-mono shrink-0 hidden lg:block">{entry.hash.slice(0, 8)}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
