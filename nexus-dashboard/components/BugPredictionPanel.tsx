import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, ActivitySquare } from 'lucide-react';

interface PredictionEvent {
    id: string;
    file: string;
    complexity: number;
    lines: number;
    riskLevel: 'High' | 'Low';
    timestamp: string;
    message: string;
}

export default function BugPredictionPanel() {
    const [events, setEvents] = useState<PredictionEvent[]>([]);

    useEffect(() => {
        const eventSource = new EventSource('/api/system/event-stream');

        eventSource.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.source === 'BugPredictor' && data.payload) {
                    const payload = JSON.parse(data.payload);
                    setEvents(prev => [{
                        id: Math.random().toString(),
                        file: payload.file,
                        complexity: payload.complexity,
                        lines: payload.lines,
                        riskLevel: payload.riskLevel,
                        timestamp: new Date().toISOString(),
                        message: data.message.replace(/\[.*?\] /, '')
                    }, ...prev].slice(0, 10)); // Keep last 10
                }
            } catch (err) {
                // Ignore parse errors
            }
        };

        return () => eventSource.close();
    }, []);

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-rose-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(244,63,94,0.1)] hover:border-rose-500/40 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-rose-500/10 transition-all" />

            <div className="flex justify-between items-center mb-6 border-b border-rose-500/20 pb-4 relative z-10">
                <h3 className="font-mono text-rose-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <ActivitySquare className="w-5 h-5" /> Code Heuristics
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded text-[10px] font-mono text-rose-300 tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Predicting Bugs
                </div>
            </div>

            <div className="space-y-3 relative z-10 min-h-[150px]">
                <AnimatePresence>
                    {events.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-8 text-slate-500 bg-slate-900/40 rounded-xl border border-dashed border-slate-700 h-full"
                        >
                            <ShieldCheck className="w-8 h-8 mb-3 opacity-50 text-rose-500/50" />
                            <span className="text-xs font-mono uppercase tracking-widest text-center">
                                Waiting for code changes.<br />Heuristics standing by.
                            </span>
                        </motion.div>
                    ) : (
                        events.map((evt) => (
                            <motion.div
                                key={evt.id}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                className={`p-3 rounded-lg border flex items-start gap-3 ${evt.riskLevel === 'High' ? 'bg-rose-500/10 border-rose-500/30' :
                                        'bg-slate-800/50 border-slate-700/50'
                                    }`}
                            >
                                <div className="mt-0.5">
                                    {evt.riskLevel === 'High' ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : <ShieldCheck className="w-4 h-4 text-slate-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className={`text-[11px] font-mono font-bold truncate ${evt.riskLevel === 'High' ? 'text-rose-300' : 'text-slate-300'
                                            }`}>
                                            {evt.file.split('/').pop()}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 ml-2">
                                            {new Date(evt.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 mt-1">
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            Complexity: <span className={evt.complexity > 15 ? 'text-rose-400' : 'text-emerald-400'}>{evt.complexity}</span>
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            Risk: <span className={evt.riskLevel === 'High' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{evt.riskLevel}</span>
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
