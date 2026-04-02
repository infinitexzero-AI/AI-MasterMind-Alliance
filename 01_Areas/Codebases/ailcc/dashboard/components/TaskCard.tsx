import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

export interface Task {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    agent: string | null;
    progress: number;
    createdAt: string;
}

const priorityColors = {
    low: 'border-slate-700/50 text-slate-400',
    medium: 'border-cyan-500/30 text-cyan-400',
    high: 'border-emerald-500/40 text-emerald-400',
    critical: 'border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
};

export default function TaskCard({ task }: { task: Task }) {
    const isPending = task.status === 'pending';
    const isActive = task.status === 'active';
    const isCompleted = task.status === 'completed';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`renaissance-panel p-4 bg-slate-900/60 border ${priorityColors[task.priority]} rounded-xl relative overflow-hidden group hover:bg-slate-800/80 transition-all`}
        >
            {/* Glow Effect for High Priority */}
            {(task.priority === 'high' || task.priority === 'critical') && (
                <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent ${task.priority === 'high' ? 'via-emerald-400' : 'via-rose-400'} to-transparent opacity-50`} />
            )}

            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">ID: {task.id}</span>
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors">
                        {task.label}
                    </h4>
                </div>
                <div className="flex items-center gap-2">
                    {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
                        isPending ? <Clock className="w-4 h-4 text-slate-400" /> :
                            <AlertCircle className="w-4 h-4 text-cyan-400 animate-pulse" />}
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-slate-400 border border-white/5">
                    <Cpu className="w-3 h-3" />
                    {task.agent || 'WAITING...'}
                </div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">
                    {task.priority}
                </div>
            </div>

            {/* Progress Section */}
            {(isActive || isCompleted) && (
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-400">Execution</span>
                        <span className={isCompleted ? 'text-emerald-400' : 'text-cyan-400'}>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'} transition-all duration-1000`}
                        />
                    </div>
                </div>
            )}

            {isPending && (
                <div className="text-[10px] font-mono text-slate-400 italic">
                    Queued in swarm buffer...
                </div>
            )}
        </motion.div>
    );
}
