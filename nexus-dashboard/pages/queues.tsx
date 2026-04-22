import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import NexusLayout from '../components/NexusLayout';
import TaskCard, { Task } from '../components/TaskCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Zap, CheckCircle2, RefreshCcw } from 'lucide-react';

interface QueueState {
    pending: Task[];
    active: Task[];
    completed: Task[];
}

export default function QueuesPage() {
    const [queues, setQueues] = useState<QueueState | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    const fetchQueues = useCallback(async () => {
        try {
            const res = await fetch('/api/system/queues');
            if (res.ok) {
                const data = await res.json();
                setQueues(data.queues);
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch queues:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQueues();
        const interval = setInterval(fetchQueues, 5000); // Polling every 5s
        return () => clearInterval(interval);
    }, [fetchQueues]);

    return (
        <NexusLayout>
            <Head>
                <title>Mission Control Queues | AILCC</title>
            </Head>
            <div className="flex flex-col h-full space-y-8 p-4 lg:p-8 max-w-[1920px] mx-auto overflow-y-auto custom-scrollbar">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 group">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-cyan-500 rounded-full" />
                            <h1 className="text-4xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">
                                SWARM OPERATIONS
                            </h1>
                        </div>
                        <p className="text-slate-400 text-sm font-mono uppercase tracking-[0.3em] pl-5">
                            Real-time Task Orchestration & Buffer Management
                        </p>
                    </div>

                    {stats && (
                        <div className="flex gap-8 mt-6 md:mt-0 font-mono">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-slate-400 uppercase">Throughput</span>
                                <span className="text-emerald-400 font-bold">{stats.throughput}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-slate-400 uppercase">Avg Latency</span>
                                <span className="text-cyan-400 font-bold">{stats.latency}</span>
                            </div>
                            <button
                                onClick={() => { setLoading(true); fetchQueues(); }}
                                title="Refresh Queues"
                                aria-label="Refresh Queues"
                                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                            >
                                <RefreshCcw className={`w-4 h-4 text-slate-400 group-hover:text-white ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    )}
                </header>

                {/* Queue Board */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">

                    {/* Pending Column */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Layers className="w-3 h-3" /> Swarm Buffer <span className="text-slate-700">({queues?.pending.length || 0})</span>
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {queues?.pending.map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </AnimatePresence>
                            {!loading && queues?.pending.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl text-slate-400 font-mono text-xs uppercase">
                                    Buffer Empty
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Column */}
                    <div className="flex flex-col space-y-4 bg-cyan-500/5 rounded-3xl p-4 border border-cyan-500/10">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3 animate-pulse" /> Processing Unit <span className="text-cyan-900">({queues?.active.length || 0})</span>
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {queues?.active.map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </AnimatePresence>
                            {!loading && queues?.active.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-cyan-500/10 rounded-2xl text-cyan-900 font-mono text-xs uppercase">
                                    No Active Engines
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Completed Column */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h3 className="font-mono text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3" /> Swarm Registry <span className="text-emerald-900">({queues?.completed.length || 0})</span>
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {queues?.completed.map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </AnimatePresence>
                            {!loading && queues?.completed.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl text-slate-400 font-mono text-xs uppercase">
                                    Registry Null
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </NexusLayout>
    );
}
