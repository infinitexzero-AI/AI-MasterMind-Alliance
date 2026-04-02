import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TestTube2, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface TestGenerationEvent {
    file: string;
    message: string;
    timestamp: string;
    status: 'success' | 'info' | 'error';
}

export default function AutonomousTestingPanel() {
    const [events, setEvents] = useState<TestGenerationEvent[]>([]);

    useEffect(() => {
        // We listen to the global SSE event stream we built in Phase 17
        const eventSource = new EventSource('/api/system/event-stream');

        eventSource.onmessage = (e) => {
            try {
                const payload = JSON.parse(e.data);
                if (payload.type === 'AUTONOMOUS_TEST_SUCCESS' || payload.type === 'AUTONOMOUS_TEST_GENERATION' || payload.type === 'AUTONOMOUS_TEST_FAILED') {
                    setEvents(prev => {
                        const newEvent: TestGenerationEvent = {
                            file: payload.payload?.file || 'unknown-file.ts',
                            message: payload.payload?.message || payload.message,
                            timestamp: new Date().toISOString(),
                            status: payload.severity || payload.type.includes('SUCCESS') ? 'success' : payload.type.includes('FAILED') ? 'error' : 'info'
                        };
                        return [newEvent, ...prev].slice(0, 10); // Keep last 10
                    });
                }
            } catch (err) {
                // Ignore parse errors on SSE stream
            }
        };

        return () => eventSource.close();
    }, []);

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:border-blue-500/40 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-blue-500/10 transition-all" />

            <div className="flex justify-between items-center mb-6 border-b border-blue-500/20 pb-4 relative z-10">
                <h3 className="font-mono text-blue-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <TestTube2 className="w-5 h-5" /> Autonomous Forge Testing
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-[10px] font-mono text-blue-300 tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Watcher Active
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
                            <TestTube2 className="w-8 h-8 mb-3 opacity-50" />
                            <span className="text-xs font-mono uppercase tracking-widest text-center">
                                Awaiting file modifications.<br />FORGE will auto-generate tests here.
                            </span>
                        </motion.div>
                    ) : (
                        events.map((evt, i) => (
                            <motion.div
                                key={`${evt.file}-${evt.timestamp}-${i}`}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                className={`p-3 rounded-lg border flex items-start gap-4 ${evt.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                    evt.status === 'error' ? 'bg-red-500/10 border-red-500/30' :
                                        'bg-blue-500/10 border-blue-500/30'
                                    }`}
                            >
                                <div className="mt-0.5">
                                    {evt.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                    {evt.status === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                                    {evt.status === 'info' && <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className={`text-xs font-mono font-bold truncate ${evt.status === 'success' ? 'text-emerald-300' :
                                            evt.status === 'error' ? 'text-red-300' :
                                                'text-blue-300'
                                            }`}>
                                            {evt.file}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 ml-2">
                                            {new Date(evt.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-mono leading-relaxed line-clamp-2">
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
