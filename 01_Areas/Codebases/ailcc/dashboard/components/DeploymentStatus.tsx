import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Check, Loader2, X } from 'lucide-react';

interface LogEntry {
    message: string;
    timestamp: number;
    status: 'info' | 'success' | 'error';
}

export const DeploymentMonitor: React.FC<{ active: boolean; onClose: () => void }> = ({ active, onClose }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!active) return;
        
        setLogs([]);
        setProgress(0);

        const eventSource = new EventSource('/api/deploy');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setLogs(prev => [...prev, { message: data.message, timestamp: Date.now(), status: data.status }]);
            setProgress(data.progress);
            
            // Auto-scroll
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }

            if (data.progress === 100) {
                eventSource.close();
            }
        };

        eventSource.onerror = () => {
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [active]);

    if (!active) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-6 font-mono border border-cyan-500/20 rounded-2xl"
        >
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    {progress < 100 ? <Loader2 className="animate-spin text-cyan-500" /> : <Check className="text-green-500" />}
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Deployment Sequence</h3>
                        <p className="text-xs text-slate-400">Target: Production [US-EAST-1]</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={16} className="text-slate-400" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-800 rounded-full mb-6 overflow-hidden">
                <motion.div 
                    className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>

            {/* Logs Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 text-xs">
                {logs.map((log, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex gap-3 ${log.status === 'success' ? 'text-green-400' : 'text-cyan-100/80'}`}
                    >
                        <span className="text-slate-400">[{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}]</span>
                        <span>{'>'} {log.message}</span>
                    </motion.div>
                ))}
                {progress < 100 && (
                     <div className="flex gap-3 text-slate-400 animate-pulse">
                        <span className="invisible">[00:00:00]</span>
                        <span>_</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
