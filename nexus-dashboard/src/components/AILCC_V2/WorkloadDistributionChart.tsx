import React from 'react';
import { Activity, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentWorkload {
    agent: string;
    activeSteps: number;
    pendingSteps: number;
    completedSteps: number;
    capacity: number;
    latency: number;
    efficiency: number;
}

interface WorkloadDistributionChartProps {
    workloads?: AgentWorkload[];
}

export default function WorkloadDistributionChart({
    workloads = [
        {
            agent: 'Comet',
            activeSteps: 0,
            pendingSteps: 1,
            completedSteps: 2,
            capacity: 45,
            latency: 2350,
            efficiency: 92
        },
        {
            agent: 'Grok',
            activeSteps: 1,
            pendingSteps: 1,
            completedSteps: 1,
            capacity: 68,
            latency: 1800,
            efficiency: 88
        },
        {
            agent: 'Gemini',
            activeSteps: 0,
            pendingSteps: 2,
            completedSteps: 0,
            capacity: 32,
            latency: 0,
            efficiency: 0
        },
        {
            agent: 'n8n',
            activeSteps: 0,
            pendingSteps: 1,
            completedSteps: 1,
            capacity: 18,
            latency: 450,
            efficiency: 95
        }
    ]
}: WorkloadDistributionChartProps) {
    const maxCapacity = Math.max(...workloads.map(w => w.capacity), 100);
    const avgCapacity = workloads.reduce((sum, w) => sum + w.capacity, 0) / workloads.length;
    const avgEfficiency = workloads.filter(w => w.efficiency > 0).reduce((sum, w) => sum + w.efficiency, 0) /
        workloads.filter(w => w.efficiency > 0).length || 0;

    const getCapacityGradient = (capacity: number) => {
        if (capacity > 80) return 'bg-gradient-to-r from-red-500 to-orange-500';
        if (capacity > 60) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
        if (capacity > 40) return 'bg-gradient-to-r from-cyan-500 to-blue-500';
        return 'bg-gradient-to-r from-green-500 to-cyan-500';
    };

    return (
        <div className="p-6 rounded-3xl border border-slate-700/20 bg-slate-900/60 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center gap-2 mb-8">
                <Activity className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Agent Workload Distribution</h3>
            </div>

            {/* Agent Workload Bars */}
            <div className="space-y-6">
                {workloads.map((workload) => (
                    <div key={workload.agent} className="space-y-2">
                        {/* Agent Name + Metrics */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-slate-100">{workload.agent}</h4>
                                <p className="text-xs text-slate-400">
                                    {workload.activeSteps} active • {workload.pendingSteps} pending • {workload.completedSteps} completed
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 text-sm font-mono">
                                    <Cpu className="w-4 h-4 text-cyan-400" />
                                    <span className="text-cyan-400">{workload.capacity.toFixed(0)}%</span>
                                </div>
                                <p className="text-xs text-slate-400">{workload.latency > 0 ? `${workload.latency}ms` : 'idle'}</p>
                            </div>
                        </div>

                        <div className="w-full h-3 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
                            <motion.div
                                className={`h-full rounded-full transition-colors duration-500 ${getCapacityGradient(workload.capacity)}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${(workload.capacity / maxCapacity) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>

                        {/* Efficiency */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">Efficiency</span>
                            <div className="w-24 h-1.5 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${workload.efficiency}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                            <span className="text-xs font-semibold text-cyan-400 w-8 text-right">
                                {workload.efficiency > 0 ? `${workload.efficiency}%` : '—'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-8 pt-8 border-t border-slate-700/20 grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Avg. Capacity</p>
                    <p className="text-lg font-bold text-cyan-400">
                        {avgCapacity.toFixed(0)}%
                    </p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Avg. Efficiency</p>
                    <p className="text-lg font-bold text-green-400">
                        {avgEfficiency.toFixed(0)}%
                    </p>
                </div>
            </div>
        </div>
    );
}
