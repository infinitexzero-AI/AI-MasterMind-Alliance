import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Agent } from '../types/DashboardInterfaces';
import { X, Cpu, Activity, Zap, Terminal, Hash, Network, Box } from 'lucide-react';

interface AgentDetailModalProps {
    agent: Agent | null;
    onClose: () => void;
}

export function AgentDetailModal({ agent, onClose }: AgentDetailModalProps) {
    if (!agent) return null;

    const isExecuting = agent.status === 'EXECUTING';
    const isOffline = agent.status === 'OFFLINE';

    return (
        <AnimatePresence>
            {agent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-slate-900/90 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Glow effect at top based on status */}
                        <div className={`h-1 w-full absolute top-0 left-0 ${isExecuting ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.8)]' :
                            isOffline ? 'bg-slate-600' :
                                'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]'
                            }`} />

                        {/* Header */}
                        <div className="flex justify-between items-start p-6 border-b border-slate-800/50 relative">
                            {/* Neural Core Animation */}
                            <div className="absolute top-6 right-16">
                                {isExecuting && (
                                    <div className="relative flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full border border-indigo-500/30 animate-[spin_3s_linear_infinite]" />
                                        <div className="w-6 h-6 rounded-full border border-indigo-400/50 animate-[spin_2s_linear_infinite_reverse] absolute" />
                                        <div className="w-4 h-4 bg-indigo-500 rounded-full shadow-[0_0_15px_#6366f1] absolute" />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isExecuting ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400' :
                                    isOffline ? 'bg-slate-800 border border-slate-700 text-slate-400' :
                                        'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                    }`}>
                                    <Cpu size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{agent.name}</h2>
                                    <div className="flex gap-2 items-center mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold tracking-widest uppercase ${isExecuting ? 'bg-indigo-500/20 text-indigo-300' :
                                            isOffline ? 'bg-slate-800 text-slate-400' :
                                                'bg-emerald-500/20 text-emerald-300'
                                            }`}>
                                            {agent.status}
                                        </span>
                                        <span className="text-[10px] text-cyan-500/70 font-mono tracking-widest font-bold uppercase border border-cyan-500/20 px-2 py-0.5 rounded bg-cyan-950/30">
                                            {agent.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                title="Close details"
                                className="text-slate-400 hover:text-white transition-colors p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Current Task Block */}
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-mono text-slate-400 tracking-widest uppercase flex items-center gap-2">
                                        <Terminal size={12} /> Active Operation
                                    </h3>
                                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-cyan-300 leading-relaxed relative overflow-hidden">
                                        {agent.currentTask ? (
                                            <>
                                                <span className="text-slate-400 mr-2">{'>'}</span>
                                                {agent.currentTask}
                                            </>
                                        ) : (
                                            <span className="text-slate-400">IDLE_AWAITING_DIRECTIVE</span>
                                        )}
                                        {isExecuting && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-[shimmer_2s_infinite]" />
                                        )}
                                    </div>
                                </div>

                                {/* Skills / Capabilities */}
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-mono text-slate-400 tracking-widest uppercase flex items-center gap-2">
                                        <Box size={12} /> Core Competencies
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {agent.skills?.map(skill => (
                                            <span key={skill} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                                                {skill}
                                            </span>
                                        )) || <span className="text-xs text-slate-400 font-mono">UNSPECIFIED_CAPABILITIES</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Telemetry */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-mono text-slate-400 tracking-widest uppercase flex items-center gap-2">
                                    <Activity size={12} /> Live Telemetry
                                </h3>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Significance */}
                                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                                        <div className="text-[10px] text-slate-400 font-mono mb-1 uppercase">Node Significance</div>
                                        <div className="flex items-end gap-2">
                                            <span className="text-2xl font-black text-cyan-400">{agent.significance ?? 0}<span className="text-cyan-600 text-sm">%</span></span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-900 rounded-full mt-2 overflow-hidden">
                                            <div className={`h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] ${(agent.significance ?? 0) < 10 ? 'w-1/12' : (agent.significance ?? 0) < 25 ? 'w-1/4' : (agent.significance ?? 0) < 50 ? 'w-1/2' : (agent.significance ?? 0) < 75 ? 'w-3/4' : (agent.significance ?? 0) < 95 ? 'w-11/12' : 'w-full'
                                                }`} />
                                        </div>
                                    </div>

                                    {/* Throughput */}
                                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                                        <div className="text-[10px] text-slate-400 font-mono mb-1 uppercase">Compute Load</div>
                                        <div className="flex items-end gap-2">
                                            <span className="text-2xl font-black text-indigo-400">{agent.throughput ?? 0}<span className="text-indigo-600 text-sm">%</span></span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-900 rounded-full mt-2 overflow-hidden">
                                            <div className={`h-full bg-indigo-500 shadow-[0_0_10px_#6366f1] ${(agent.throughput ?? 0) < 10 ? 'w-1/12' : (agent.throughput ?? 0) < 25 ? 'w-1/4' : (agent.throughput ?? 0) < 50 ? 'w-1/2' : (agent.throughput ?? 0) < 75 ? 'w-3/4' : (agent.throughput ?? 0) < 95 ? 'w-11/12' : 'w-full'
                                                }`} />
                                        </div>
                                    </div>

                                    {/* Session Cost */}
                                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 col-span-2 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Zap size={14} className="text-emerald-400" />
                                            <span className="text-[10px] text-slate-400 font-mono uppercase">Session Burn Rate</span>
                                        </div>
                                        <span className="font-mono font-bold text-emerald-400 text-sm">
                                            ${(agent.costSession ?? 0).toFixed(4)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Terminal-like border */}
                        <div className="bg-slate-950 p-3 border-t border-slate-800/80 flex justify-between items-center">
                            <div className="text-[9px] text-slate-400 font-mono flex items-center gap-2">
                                <Network size={10} /> ID: {agent.id.toUpperCase()}_NODE
                            </div>
                            <div className="text-[9px] text-slate-400 font-mono flex items-center gap-2">
                                <Hash size={10} /> SYS_SYNC: OK
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
