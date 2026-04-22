import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingDown, AlertTriangle } from 'lucide-react';

interface RegressionEvent {
    id: string;
    endpoint: string;
    message: string;
    timestamp: string;
    latency: number;
    baseline: number;
}

export default function RegressionVisualizer() {
    const [events, setEvents] = useState<RegressionEvent[]>([]);

    useEffect(() => {
        const eventSource = new EventSource('/api/system/event-stream');

        eventSource.onmessage = (e) => {
            try {
                const payload = JSON.parse(e.data);
                if (payload.message && payload.message.includes('[PERFORMANCE REGRESSION]')) {

                    // message format: [PERFORMANCE REGRESSION] Cortex Plan latency spiked to 120ms (Baseline: 45ms)...
                    const msg = payload.message as string;
                    const endpointMatch = msg.match(/\] (.+?) latency spiked/);
                    const latencyMatch = msg.match(/spiked to (\d+)ms/);
                    const baselineMatch = msg.match(/Baseline: (\d+)ms/);

                    if (endpointMatch && latencyMatch && baselineMatch) {
                        setEvents(prev => [{
                            id: Math.random().toString(),
                            endpoint: endpointMatch[1],
                            message: msg.replace(/\[.*?\] /, ''),
                            latency: parseInt(latencyMatch[1]),
                            baseline: parseInt(baselineMatch[1]),
                            timestamp: new Date().toISOString()
                        }, ...prev].slice(0, 5));
                    }
                }
            } catch (err) {
                // Ignore bad JSON frames
            }
        };

        return () => eventSource.close();
    }, []);

    return (
        <div className="renaissance-panel p-6 bg-slate-950/80 backdrop-blur-xl border border-rose-500/20 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(244,63,94,0.1)] hover:border-rose-500/40 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-rose-500/10 transition-all" />

            <div className="flex justify-between items-center mb-6 border-b border-rose-500/20 pb-4 relative z-10">
                <h3 className="font-mono text-rose-400 font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                    <Activity className="w-5 h-5" /> Performance Regressions
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded text-[10px] font-mono text-rose-300 tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Tracking Latency
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
                            <TrendingDown className="w-8 h-8 mb-3 opacity-50" />
                            <span className="text-xs font-mono uppercase tracking-widest text-center text-emerald-500/70">
                                System Operating Optimally.<br />No latency spikes detected.
                            </span>
                        </motion.div>
                    ) : (
                        events.map((evt) => (
                            <motion.div
                                key={evt.id}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex flex-col gap-2"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        {evt.endpoint}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-500">
                                        {new Date(evt.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>

                                {/* Visual Latency Comparison */}
                                <div className="space-y-1 mt-1">
                                    <div className="flex items-center gap-2 text-[10px] font-mono">
                                        <span className="w-16 text-slate-400">Baseline</span>
                                        <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 h-full w-[30%]" />
                                        </div>
                                        <span className="w-8 text-right text-emerald-400">{evt.baseline}ms</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-mono">
                                        <span className="w-16 text-slate-400">Spike</span>
                                        <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-rose-500 h-full w-[80%]" />
                                        </div>
                                        <span className="w-8 text-right text-rose-400">{evt.latency}ms</span>
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
