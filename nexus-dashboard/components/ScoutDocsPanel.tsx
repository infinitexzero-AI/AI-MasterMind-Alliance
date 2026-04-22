import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSignature, Code2, TerminalSquare, SearchCode } from 'lucide-react';

interface ScoutEvent {
    id: string;
    message: string;
    timestamp: string;
    status: 'success' | 'info' | 'error';
}

export default function ScoutDocsPanel() {
    const [events, setEvents] = useState<ScoutEvent[]>([]);

    useEffect(() => {
        const eventSource = new EventSource('/api/system/event-stream');

        eventSource.onmessage = (e) => {
            try {
                const payload = JSON.parse(e.data);
                if (payload.message && payload.message.includes('[AUTO_DOC]') || payload.message?.includes('[SCOUT_PASS_COMPLETE]')) {
                    setEvents(prev => [{
                        id: Math.random().toString(),
                        message: payload.message.replace(/\[.*?\] /, ''),
                        timestamp: new Date().toISOString(),
                        status: payload.severity || 'info'
                    }, ...prev].slice(0, 10)); // Keep last 10
                }
            } catch (err) {
                // Ignore parse errors
            }
        };

        return () => eventSource.close();
    }, []);

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-sky-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(14,165,233,0.1)] hover:border-sky-500/40 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-sky-500/10 transition-all" />

            <div className="flex justify-between items-center mb-6 border-b border-sky-500/20 pb-4 relative z-10">
                <h3 className="font-mono text-sky-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <FileSignature className="w-5 h-5" /> Auto-Docs (SCOUT)
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded text-[10px] font-mono text-sky-300 tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                    Scanning AST
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
                            <SearchCode className="w-8 h-8 mb-3 opacity-50 text-sky-500/50" />
                            <span className="text-xs font-mono uppercase tracking-widest text-center">
                                All code fully documented.<br />SCOUT is standing by.
                            </span>
                        </motion.div>
                    ) : (
                        events.map((evt) => (
                            <motion.div
                                key={evt.id}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                className={`p-3 rounded-lg border flex items-start gap-3 ${evt.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                        'bg-sky-500/10 border-sky-500/30'
                                    }`}
                            >
                                <div className="mt-0.5">
                                    {evt.message.includes('Generated') ? <Code2 className="w-4 h-4 text-sky-400" /> : <TerminalSquare className="w-4 h-4 text-emerald-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className={`text-[11px] font-mono font-bold truncate ${evt.status === 'success' ? 'text-emerald-300' : 'text-sky-300'
                                            }`}>
                                            {evt.message.includes('Mutated') ? 'Pass Complete' : 'TSDoc Injected'}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 ml-2">
                                            {new Date(evt.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                                        {evt.message}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
