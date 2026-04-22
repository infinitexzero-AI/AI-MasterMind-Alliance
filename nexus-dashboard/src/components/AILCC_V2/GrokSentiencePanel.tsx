import React, { useState, useCallback } from 'react';
import { Brain, Zap, Activity, ShieldCheck, TrendingUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { traceEvent } from '@/lib/comet';

interface SynthesisState {
    loading: boolean;
    synthesis: string | null;
    error: string | null;
    lastUpdated: string | null;
}

export const GrokSentiencePanel = () => {
    const [state, setState] = useState<SynthesisState>({
        loading: false,
        synthesis: null,
        error: null,
        lastUpdated: null,
    });

    const triggerSynthesis = useCallback(async () => {
        setState((prev: SynthesisState) => ({ ...prev, loading: true, error: null }));

        try {
            const res = await fetch('/api/studio/grok', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'research',
                    input: 'Analyze current AI Mastermind Alliance system architecture and propose the single highest-leverage optimization for autonomous task orchestration, scholarly research acceleration, and financial sovereignty. Be bold and technical.',
                    context: 'Multi-agent swarm using Grok, Gemini, Comet, Antigravity, and Valentine with Next.js dashboard, Redis memory, and Airtable persistence.'
                }),
            });

            if (!res.ok) throw new Error(`API Error: ${res.status}`);

            const data = await res.json();
            
            // Autonomous Audit: Trace Grok Synthesis
            traceEvent('Grok_Strategic_Synthesis', 
                { mode: 'research', prompt: 'Analyze current AI Mastermind Alliance...' },
                data.output || data.error,
                { source: 'Dashboard_V2', engine: 'xAI_Grok' }
            ).catch(console.error);

            setState({
                loading: false,
                synthesis: data.output || data.error || 'No synthesis generated.',
                error: null,
                lastUpdated: new Date().toLocaleTimeString(),
            });
        } catch (err) {
            setState((prev: SynthesisState) => ({
                ...prev,
                loading: false,
                error: err instanceof Error ? err.message : 'Synthesis failed',
            }));
        }
    }, []);

    const displayText = state.synthesis
        || "\"The convergence of academic credentials and agentic intelligence creates a unique leverage point. Prioritize the 2023 Appeal for maximum systemic release.\"";

    const completionPct = state.synthesis ? 100 : 94;

    return (
        <motion.section 
            animate={{ 
                boxShadow: state.loading 
                    ? "0 0 30px rgba(6, 182, 212, 0.2)" 
                    : "0 8px 32px rgba(0, 0, 0, 0.3)"
            }}
            transition={{ duration: 1.5, repeat: state.loading ? Infinity : 0, repeatType: "reverse" }}
            className={`glass-card p-6 space-y-6 relative overflow-hidden group transition-colors duration-700 ${
                state.loading ? 'border-cyan-500/40' : 'border-white/10'
            }`}
        >
            {/* Antigravity Pulse Aura */}
            {state.loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.05, 0.15, 0.05] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-cyan-500/5 pointer-events-none"
                />
            )}

            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />

            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-lg shadow-cyan-950/20">
                        <Brain className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Strategic Sentience</h2>
                        <p className="text-sm text-slate-400 font-mono tracking-tight uppercase">xAI / Grok Intelligence</p>
                    </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                    <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 uppercase">FORECASTING_ACTIVE</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase text-xs ${
                        state.loading
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/20'
                            : state.error
                                ? 'bg-red-500/20 text-red-400 border-red-500/20'
                                : 'bg-green-500/20 text-green-400 border-green-500/20'
                    }`}>
                        {state.loading ? 'SYNTHESIZING...' : state.error ? 'ERROR' : 'SENTIENCE_OPTIMAL'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Forecasting Feed */}
                <div className="glass-card p-4 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Live Forecasting Feed</p>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                        />
                    </div>
                    <div className="space-y-4 font-mono text-[11px]">
                        <div className="border-l-2 border-cyan-500/40 pl-3 py-1 bg-cyan-500/5 rounded-r">
                            <div className="flex items-center gap-1.5 mb-1">
                                <TrendingUp className="w-3 h-3 text-cyan-400" />
                                <p className="text-cyan-400 font-bold">[TREND_DETECTED]</p>
                            </div>
                            <p className="text-slate-300 leading-relaxed">Neural-Hardware Convergence accelerating in Q1 2026.</p>
                        </div>
                        <div className="border-l-2 border-slate-700/50 pl-3 py-1 hover:border-slate-500 transition-colors">
                            <div className="flex items-center gap-1.5 mb-1">
                                <ShieldCheck className="w-3 h-3 text-slate-500" />
                                <p className="text-slate-500">[RISK_MITIGATION]</p>
                            </div>
                            <p className="text-slate-400 leading-relaxed">SSD lifecycle optimization required for high-density IQ.</p>
                        </div>
                    </div>
                </div>

                {/* Grokipedia Loop — Now Live */}
                <div className="glass-card p-4 relative overflow-hidden group/text">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover/text:opacity-100 transition-opacity" />
                    <p className="text-[10px] text-slate-500 font-mono mb-3 uppercase tracking-wider">Grokipedia Synthesis</p>

                    <AnimatePresence mode="wait">
                        {state.loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center py-6"
                            >
                                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                                <span className="ml-2 text-xs text-cyan-400 font-mono">Grok is synthesizing...</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-[12px] leading-relaxed text-slate-300 italic font-serif relative z-10 p-2 bg-slate-900/30 rounded-lg border border-slate-800/30 max-h-32 overflow-y-auto"
                            >
                                {displayText}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {state.error && (
                        <p className="text-[10px] text-red-400 font-mono mt-2">⚠ {state.error}</p>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono relative z-10">
                        <span className="text-slate-500 uppercase">
                            {state.lastUpdated ? `UPDATED ${state.lastUpdated}` : 'SYNTHESIS_LOCK'}
                        </span>
                        <span className="text-cyan-400 font-bold">{completionPct}% COMPLETE</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden relative z-10">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPct}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                        />
                    </div>
                </div>

                {/* IQ Metrics */}
                <div className="glass-card p-4">
                    <p className="text-[10px] text-slate-500 font-mono mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Intelligence Grid
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-2 text-center font-mono">
                        <div className="p-2.5 bg-slate-900/50 rounded-lg border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                            <p className="text-[9px] text-slate-500 uppercase">Latency</p>
                            <p className="text-sm text-green-400 font-bold">14ms</p>
                        </div>
                        <div className="p-2.5 bg-slate-900/50 rounded-lg border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                            <p className="text-[9px] text-slate-500 uppercase">Density</p>
                            <p className="text-sm text-cyan-400 font-bold uppercase">High</p>
                        </div>
                        <div className="p-2.5 bg-slate-900/50 rounded-lg border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                            <p className="text-[9px] text-slate-500 uppercase">Reasoning</p>
                            <p className="text-sm text-purple-400 font-bold">3.8<span className="text-slate-600">/4</span></p>
                        </div>
                        <div className="p-2.5 bg-slate-900/50 rounded-lg border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                            <p className="text-[9px] text-slate-500 uppercase">Uptime</p>
                            <p className="text-sm text-green-400 font-bold">99.9%</p>
                        </div>
                    </div>
                    <button
                        onClick={triggerSynthesis}
                        disabled={state.loading}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-2 py-1.5 bg-cyan-500/5 border border-cyan-500/10 rounded-lg cursor-pointer hover:bg-cyan-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {state.loading ? (
                            <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                        ) : (
                            <Zap className="w-3 h-3 text-cyan-400" />
                        )}
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                            {state.loading ? 'Synthesizing...' : 'Update Synthesis'}
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default GrokSentiencePanel;
