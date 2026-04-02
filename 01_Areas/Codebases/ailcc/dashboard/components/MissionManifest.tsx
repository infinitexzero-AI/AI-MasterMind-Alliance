import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ListChecks, ChevronRight, Circle, CheckCircle2, Clock } from 'lucide-react';

interface Task {
    id: number;
    label: string;
    status: 'completed' | 'pending' | 'in-progress';
}

interface Phase {
    name: string;
    tasks: Task[];
}

export const MissionManifest: React.FC = () => {
    const [phases, setPhases] = useState<Phase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking the fetch for now, can be connected to /api/roadmap later
        const mockData: Phase[] = [
            {
                name: "PHASE 1-3: CORE CONVERGENCE",
                tasks: [
                    { id: 1, label: "Multi-Page Dashboard", status: "completed" },
                    { id: 36, label: "Intelligence Sync (Vault)", status: "completed" },
                    { id: 71, label: "Autonomous Debugging", status: "completed" },
                    { id: 100, label: "Singularity Baseline", status: "completed" },
                ]
            },
            {
                name: "PHASE 4: HYPER-ORCHESTRATION",
                tasks: [
                    { id: 101, label: "Adaptive Context Switch", status: "completed" },
                    { id: 102, label: "Vault RAG Indexing", status: "completed" },
                    { id: 104, label: "Swarm Budget Governor", status: "completed" },
                    { id: 106, label: "Sustainable Abundance HUD", status: "completed" },
                    { id: 125, label: "Singularity Final Audit", status: "completed" },
                ]
            }
        ];
        setPhases(mockData);
        setLoading(false);
    }, []);

    if (loading) return <div className="animate-pulse h-48 bg-slate-800/20 rounded-lg"></div>;

    return (
        <div className="flex flex-col gap-4 font-mono">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <ListChecks size={16} className="text-cyan-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Mission Roadmap</h3>
                </div>
                <span className="text-[10px] text-emerald-500 font-bold">V4.2 CONVERGED</span>
            </div>

            <div className="space-y-6">
                {phases.map((phase, idx) => (
                    <div key={idx} className="space-y-2">
                        <div className="text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                            <ChevronRight size={10} />
                            {phase.name}
                        </div>
                        <div className="space-y-1.5 ml-2">
                            {phase.tasks.map((task) => (
                                <div key={task.id} className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-1 rounded transition-colors">
                                    <StatusIcon status={task.status} />
                                    <span className={`text-[11px] ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-300'}`}>
                                        {task.label}
                                    </span>
                                    <span className="hidden group-hover:block ml-auto text-[9px] text-cyan-500 uppercase font-bold">Delegate</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
        case 'completed': return <CheckCircle2 size={12} className="text-emerald-500" />;
        case 'in-progress': return <Clock size={12} className="text-amber-500 animate-pulse" />;
        default: return <Circle size={12} className="text-slate-700" />;
    }
};
