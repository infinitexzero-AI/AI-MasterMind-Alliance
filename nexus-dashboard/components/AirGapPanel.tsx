import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, ShieldAlert, AlertTriangle } from 'lucide-react';

interface AirGapState {
    enabled: boolean;
    enabledAt?: string;
    reason?: string;
}

export default function AirGapPanel() {
    const [state, setState] = useState<AirGapState>({ enabled: false });
    const [loading, setLoading] = useState(false);

    const fetchState = useCallback(async () => {
        try {
            const res = await fetch('/api/system/air-gap');
            if (res.ok) setState(await res.json());
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        fetchState();
        const interval = setInterval(fetchState, 10000);
        return () => clearInterval(interval);
    }, [fetchState]);

    const toggle = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/system/air-gap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enable: !state.enabled, enabledBy: 'DASHBOARD', reason: 'Manual toggle' })
            });
            if (res.ok) setState(await res.json().then(d => d.state));
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl rounded-2xl relative overflow-hidden group transition-all ${state.enabled
                ? 'border border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]'
                : 'border border-slate-600/30 shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:border-slate-500/40'
            }`}>
            <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none transition-all ${state.enabled ? 'bg-red-500/10' : 'bg-slate-500/5'}`} />

            <div className="flex justify-between items-center mb-6 border-b border-slate-700/40 pb-4 relative z-10">
                <h3 className={`font-mono font-bold uppercase tracking-[0.2em] flex items-center gap-3 ${state.enabled ? 'text-red-400' : 'text-slate-400'}`}>
                    {state.enabled ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
                    Air-Gap Mode
                </h3>
                {state.enabled && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/40 rounded text-[10px] font-mono text-red-300 tracking-widest uppercase animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> ACTIVE
                    </div>
                )}
            </div>

            <div className="relative z-10 space-y-5">
                {/* Status indicator */}
                <div className={`p-4 rounded-xl border text-center ${state.enabled ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-900/40 border-slate-700/30'}`}>
                    <div className={`text-4xl mb-2 ${state.enabled ? 'grayscale-0' : 'opacity-30'}`}>
                        {state.enabled ? '🔌' : '🌐'}
                    </div>
                    <p className={`font-mono text-sm font-bold ${state.enabled ? 'text-red-300' : 'text-slate-400'}`}>
                        {state.enabled ? 'External Network BLOCKED' : 'External Network Active'}
                    </p>
                    {state.enabled && state.enabledAt && (
                        <p className="text-[10px] text-red-500/70 font-mono mt-1">
                            Since {new Date(state.enabledAt).toLocaleTimeString()}
                        </p>
                    )}
                </div>

                {state.enabled && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-red-400/80 font-mono space-y-1 bg-red-500/5 p-3 rounded-lg border border-red-500/20">
                        <div className="flex items-center gap-2"><ShieldAlert className="w-3 h-3" /> All outbound HTTP blocked</div>
                        <div className="flex items-center gap-2"><ShieldAlert className="w-3 h-3" /> LLM traffic forced to local Ollama</div>
                        <div className="flex items-center gap-2"><ShieldAlert className="w-3 h-3" /> External API integrations suspended</div>
                    </motion.div>
                )}

                <button
                    onClick={toggle}
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-mono font-bold text-sm uppercase tracking-widest transition-all border ${state.enabled
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                            : 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30'
                        } disabled:opacity-50`}
                >
                    {loading ? 'Switching...' : state.enabled ? '🌐 Restore Network' : '🔌 Engage Air-Gap'}
                </button>
            </div>
        </div>
    );
}
