import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldOff, ShieldCheck, Code } from 'lucide-react';

interface GuardianEvent {
    id: string;
    file: string;
    status: 'ok' | 'violation';
    message: string;
    timestamp: string;
}

export default function TypeGuardianPanel() {
    const [events, setEvents] = useState<GuardianEvent[]>([]);

    useEffect(() => {
        const es = new EventSource('/api/system/event-stream');
        es.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.source !== 'TypeGuardian') return;
                const isViolation = data.message?.includes('INTEGRITY_VIOLATION');
                const file = data.message?.match(/editing\s+(\S+\.tsx?)/)?.[1] ?? data.message?.match(/(\S+\.tsx?)\s/)?.[1] ?? 'Unknown file';
                setEvents(prev => [{
                    id: Math.random().toString(),
                    file,
                    status: (isViolation ? 'violation' : 'ok') as 'ok' | 'violation',
                    message: data.message?.replace(/\[.*?\] /, '') ?? '',
                    timestamp: new Date().toISOString()
                }, ...prev].slice(0, 8));
            } catch { /* ignore */ }
        };
        return () => es.close();
    }, []);

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-violet-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(139,92,246,0.1)] hover:border-violet-500/40 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="flex justify-between items-center mb-6 border-b border-violet-500/20 pb-4 relative z-10">
                <h3 className="font-mono text-violet-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <Code className="w-5 h-5" /> Type Guardian
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/30 rounded text-[10px] font-mono text-violet-300 tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                    Watching FS
                </div>
            </div>
            <div className="space-y-3 relative z-10 min-h-[120px]">
                <AnimatePresence>
                    {events.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-8 text-slate-500 bg-slate-900/40 rounded-xl border border-dashed border-slate-700">
                            <ShieldCheck className="w-8 h-8 mb-3 opacity-50 text-violet-500/50" />
                            <span className="text-xs font-mono uppercase tracking-widest">Watching for type mutations...</span>
                        </motion.div>
                    ) : events.map(evt => (
                        <motion.div key={evt.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            className={`p-3 rounded-lg border flex items-start gap-3 ${evt.status === 'violation' ? 'bg-red-500/10 border-red-500/30' : 'bg-violet-500/5 border-violet-500/20'}`}>
                            {evt.status === 'violation' ? <ShieldOff className="w-4 h-4 text-red-400 mt-0.5 shrink-0" /> : <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between mb-1">
                                    <span className={`text-[11px] font-mono font-bold truncate ${evt.status === 'violation' ? 'text-red-300' : 'text-emerald-300'}`}>
                                        {evt.status === 'violation' ? '⚠ Type Violation' : '✓ Type Safe'}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono ml-2 shrink-0">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-mono leading-relaxed line-clamp-2">{evt.message}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
