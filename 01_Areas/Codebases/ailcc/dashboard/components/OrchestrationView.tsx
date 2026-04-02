import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, AlertCircle, ArrowUpRight, Loader2 } from 'lucide-react';

interface LinearIssue {
    id: string;
    title: string;
    identifier: string;
    priority: number;
    state: {
        name: string;
        color: string;
    };
    url?: string;
}

export const OrchestrationView: React.FC = () => {
    const [issues, setIssues] = useState<LinearIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchIssues();
        // Poll every 30 seconds for "Live Thought Stream" feel
        const interval = setInterval(fetchIssues, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchIssues = async () => {
        try {
            const res = await fetch('/api/linear/issues');
            const data = await res.json();
            if (data.success) {
                setIssues(data.data);
                setError(null);
            } else {
                setError(data.error || 'Failed to sync');
            }
        } catch (err) {
            setError('Connection failure');
        } finally {
            setLoading(false);
        }
    };

    const getPriorityIcon = (p: number) => {
        if (p === 1) return <AlertCircle className="text-red-500" size={14} />;
        if (p === 2) return <ArrowUpRight className="text-yellow-500" size={14} />;
        return <Circle className="text-slate-400" size={14} />;
    };

    return (
        <div className="w-full h-full flex flex-col renaissance-panel p-4 overflow-hidden relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Executive Queue
                </h2>
                {loading && <Loader2 className="animate-spin text-slate-400" size={14} />}
            </div>

            {/* Error State */}
            {error && (
                <div className="text-[10px] text-red-400 bg-red-950/20 p-2 rounded mb-2 border border-red-500/20">
                    ⚠ {error}
                </div>
            )}

            {/* Content List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                <AnimatePresence>
                    {issues.map((issue, i) => (
                        <motion.div
                            key={issue.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group relative bg-slate-900/40 border border-white/5 hover:border-blue-500/30 rounded-lg p-3 transition-all hover:bg-slate-800/40 cursor-pointer"
                            onClick={() => issue.url && window.open(issue.url, '_blank')}
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div className="mt-1">
                                    {getPriorityIcon(issue.priority)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-slate-200 font-medium truncate group-hover:text-blue-200 transition-colors">
                                        {issue.title}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-mono text-slate-400">
                                            {issue.identifier}
                                        </span>
                                        <span 
                                            className="text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold"
                                            style={{ 
                                                backgroundColor: `${issue.state.color}20`, 
                                                color: issue.state.color,
                                                borderColor: `${issue.state.color}40`,
                                                borderWidth: '1px'
                                            }}
                                        >
                                            {issue.state.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                                    <ArrowUpRight size={12} className="text-slate-400" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!loading && issues.length === 0 && (
                     <div className="text-center py-8 text-slate-400 text-xs italic">
                        Neural pathway clear. No active tasks.
                    </div>
                )}
            </div>
            
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
};
