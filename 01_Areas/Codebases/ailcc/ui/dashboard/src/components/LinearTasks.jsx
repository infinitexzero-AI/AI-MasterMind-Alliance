import { useState, useEffect } from 'react';
import { CheckSquare, ExternalLink, AlertCircle, Circle, Clock, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { cortexAPI } from '../services/cortexAPI';
import { CreateTaskDialog } from './CreateTaskDialog';

const PriorityBadge = ({ priority }) => {
    const colors = {
        0: 'text-slate-500',
        1: 'text-blue-400',
        2: 'text-yellow-400',
        3: 'text-orange-400',
        4: 'text-red-400'
    };
    const labels = {
        0: 'No Priority',
        1: 'Low',
        2: 'Medium',
        3: 'High',
        4: 'Urgent'
    };
    return (
        <span className={clsx('text-[10px] font-bold font-mono', colors[priority] || colors[0])}>
            {labels[priority] || 'Unknown'}
        </span>
    );
};

export const LinearTasks = () => {
    const [linearData, setLinearData] = useState({ projects: [], issues: [], recent_activity: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState('RECENT'); // RECENT, ALL_ISSUES, PROJECTS
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const loadLinearData = async () => {
            setIsLoading(true);
            try {
                const response = await cortexAPI.getLinearData();
                if (response.status === 'success') {
                    setLinearData(response.data);
                }
            } catch (error) {
                console.error('Failed to load Linear data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadLinearData();
        // Refresh every 30 seconds
        const interval = setInterval(loadLinearData, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatDate = (isoString) => {
        if (!isoString) return 'No date';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleTaskCreated = async (issue) => {
        // Refresh Linear data after task creation
        const response = await cortexAPI.getLinearData();
        if (response.status === 'success') {
            setLinearData(response.data);
        }
    };

    return (
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-sm font-bold flex items-center gap-2 font-orbitron tracking-widest text-yellow-400">
                        <CheckSquare className="w-4 h-4" /> LINEAR TASKS
                    </h2>
                    <button
                        onClick={() => setIsDialogOpen(true)}
                        className="px-3 py-1 text-[10px] rounded font-mono font-bold bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" />
                        CREATE
                    </button>
                </div>
                <div className="flex gap-2">
                    {['RECENT', 'ALL_ISSUES', 'PROJECTS'].map(v => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={clsx(
                                "px-2 py-1 text-[10px] rounded font-mono transition-all",
                                view === v
                                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                                    : "bg-white/5 text-slate-500 hover:text-white"
                            )}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-slate-500 text-sm font-mono animate-pulse">Loading Linear data...</div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {view === 'PROJECTS' && (
                        <AnimatePresence mode="popLayout">
                            {linearData.projects.map((project, idx) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-sm font-bold text-white font-mono">{project.name}</h3>
                                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    {project.description && (
                                        <p className="text-xs text-slate-400 mb-2 line-clamp-2">{project.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 text-[10px]">
                                        <span className="text-slate-500">State: <span className="text-cyan-400">{project.state}</span></span>
                                        {project.progress !== undefined && (
                                            <span className="text-slate-500">Progress: <span className="text-green-400">{Math.round(project.progress * 100)}%</span></span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {view === 'ALL_ISSUES' && (
                        <AnimatePresence mode="popLayout">
                            {linearData.issues.map((issue, idx) => (
                                <motion.div
                                    key={issue.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-500 font-mono">{issue.identifier}</span>
                                            <h3 className="text-xs font-bold text-white">{issue.title}</h3>
                                        </div>
                                        <a href={issue.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] flex-wrap">
                                        <span className="text-slate-500">State: <span className="text-cyan-400">{issue.state?.name}</span></span>
                                        <PriorityBadge priority={issue.priority} />
                                        {issue.assignee && (
                                            <span className="text-slate-500">Assignee: <span className="text-purple-400">{issue.assignee.name}</span></span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {view === 'RECENT' && (
                        <AnimatePresence mode="popLayout">
                            {linearData.recent_activity.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-500 font-mono">{item.identifier}</span>
                                            <h3 className="text-xs font-bold text-white">{item.title}</h3>
                                        </div>
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px]">
                                        <span className="text-slate-500">{item.state?.name}</span>
                                        <span className="text-slate-600">• Updated {formatDate(item.updatedAt)}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {(view === 'PROJECTS' && linearData.projects.length === 0) ||
                        (view === 'ALL_ISSUES' && linearData.issues.length === 0) ||
                        (view === 'RECENT' && linearData.recent_activity.length === 0) ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                            <CheckSquare className="w-8 h-8 opacity-20" />
                            <span className="text-xs font-mono">NO DATA AVAILABLE</span>
                        </div>
                    ) : null}
                </div>
            )}

            {/* Create Task Dialog */}
            <CreateTaskDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onTaskCreated={handleTaskCreated}
            />
        </div>
    );
};
