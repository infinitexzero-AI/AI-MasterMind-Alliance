import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Snowflake, Play, Users } from 'lucide-react';
import { SWARM_AGENTS } from '../lib/agent-identity';

interface QuarantinedAgent {
    id: string;
    name: string;
    quarantinedAt: string;
    reason: string;
    active: boolean;
}

export default function QuarantinePanel() {
    const [quarantined, setQuarantined] = useState<QuarantinedAgent[]>([]);
    const [loading, setLoading] = useState<string | null>(null);

    const fetchState = useCallback(async () => {
        try {
            const res = await fetch('/api/system/quarantine');
            if (res.ok) {
                const data = await res.json();
                setQuarantined(data.quarantined ?? []);
            }
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        fetchState();
        const interval = setInterval(fetchState, 8000);
        return () => clearInterval(interval);
    }, [fetchState]);

    const quarantineAgent = async (agentName: string) => {
        const agentId = `AGT-${agentName.toUpperCase()}`;
        setLoading(agentId);
        try {
            await fetch('/api/system/quarantine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId, name: agentName, reason: 'Manual quarantine from dashboard' })
            });
            fetchState();
        } catch { /* ignore */ } finally { setLoading(null); }
    };

    const releaseAgent = async (agentId: string) => {
        setLoading(agentId);
        try {
            await fetch('/api/system/quarantine', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId })
            });
            fetchState();
        } catch { /* ignore */ } finally { setLoading(null); }
    };

    const quarantinedIds = new Set(quarantined.map(q => q.id));

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(14,165,233,0.1)] hover:border-sky-500/40 transition-all col-span-2">
            <div className="absolute top-0 right-0 w-96 h-64 bg-sky-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />

            <div className="flex justify-between items-center mb-5 border-b border-sky-500/20 pb-4 relative z-10">
                <h3 className="font-mono text-sky-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <Snowflake className="w-5 h-5" /> Agent Quarantine
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded text-[10px] font-mono text-sky-300 tracking-widest uppercase">
                    <Users className="w-3 h-3" /> {quarantined.length} Frozen
                </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {SWARM_AGENTS.map(agent => {
                    const agentId = `AGT-${agent.toUpperCase()}`;
                    const isQuarantined = quarantinedIds.has(agentId);
                    const isLoading = loading === agentId;

                    return (
                        <motion.div
                            key={agent}
                            animate={{ scale: isQuarantined ? 0.98 : 1 }}
                            className={`p-3 rounded-xl border text-center transition-all cursor-default ${isQuarantined
                                    ? 'bg-sky-500/10 border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.2)]'
                                    : 'bg-slate-900/40 border-slate-700/30 hover:border-slate-600/50'
                                }`}
                        >
                            <div className="text-xl mb-1.5">{isQuarantined ? '🧊' : '🤖'}</div>
                            <div className={`text-[11px] font-mono font-bold mb-2 ${isQuarantined ? 'text-sky-300' : 'text-slate-300'}`}>
                                {agent}
                            </div>
                            <button
                                disabled={isLoading}
                                onClick={() => isQuarantined ? releaseAgent(agentId) : quarantineAgent(agent)}
                                className={`w-full text-[9px] font-mono px-1.5 py-1 rounded border uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center gap-1 ${isQuarantined
                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                                        : 'bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500/20'
                                    }`}
                            >
                                {isLoading ? '...' : isQuarantined ? <><Play className="w-3 h-3" /> Release</> : <><Snowflake className="w-3 h-3" /> Freeze</>}
                            </button>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {quarantined.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-1.5">
                        <p className="text-[10px] text-sky-400/70 font-mono uppercase tracking-widest mb-2">Frozen Agents</p>
                        {quarantined.map(q => (
                            <div key={q.id} className="flex justify-between items-center p-2 bg-sky-500/5 border border-sky-500/20 rounded-lg text-[11px] font-mono">
                                <span className="text-sky-300 font-bold">{q.name}</span>
                                <span className="text-slate-500">{q.reason}</span>
                                <span className="text-slate-600">{new Date(q.quarantinedAt).toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
