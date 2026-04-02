import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

interface SynapseEvent {
    id: string;
    agent: string;
    intent: string;
    confidence: number;
    risk_reward: string;
    domain: string;
    timestamp: string;
    details?: any;
}

export const NeuralSynapseStream: React.FC = () => {
    const [events, setEvents] = useState<SynapseEvent[]>([]);

    useEffect(() => {
        const socket = io(SOCKET_URL);

        socket.on('NEURAL_SYNAPSE', (data: SynapseEvent) => {
            setEvents(prev => [data, ...prev].slice(0, 10));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Neural Synapse Stream (Ω)
                </h2>
                <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-indigo-500" />
                    <span className="text-[8px] font-mono text-indigo-500 uppercase tracking-widest">Real-time Optimization</span>
                </div>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                <AnimatePresence initial={false}>
                    {events.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30">
                            <Zap className="w-8 h-8 mb-2 animate-pulse" />
                            <p className="text-[10px] font-mono uppercase">Listening for System Intent...</p>
                        </div>
                    ) : (
                        events.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`glass-card p-3 border-l-2 ${
                                    event.agent === 'OPTIMIZER' ? 'border-indigo-500' : 'border-cyan-500'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                            event.agent === 'OPTIMIZER' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'
                                        }`}>
                                            {event.agent}
                                        </span>
                                        <span className="text-[9px] font-mono text-slate-500">
                                            {new Date(event.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Shield className={`w-3 h-3 ${event.confidence > 0.8 ? 'text-emerald-400' : 'text-amber-400'}`} />
                                        <span className="text-[10px] font-mono font-bold text-slate-300">
                                            {(event.confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[11px] font-bold text-white mb-1">{event.intent}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[8px] font-mono text-slate-500 uppercase">{event.domain}</span>
                                    {event.details && (
                                        <div className="flex items-center gap-1 text-[8px] font-mono text-indigo-400">
                                            <Info className="w-2.5 h-2.5" />
                                            <span>AUTO-PROC: {event.details.action || 'LOGGED'}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
