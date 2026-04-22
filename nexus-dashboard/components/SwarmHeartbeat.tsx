import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface AgentHeartbeat {
    id: string;
    name: string;
    status: string;
    load: number; // 0-100
}

export const SwarmHeartbeat = ({ agents }: { agents: any[] }) => {
    // Determine overall swarm vitality
    const activeCount = agents.filter(a => a.status !== 'OFFLINE').length;
    const totalCount = 11; // Swarm capacity
    const vitality = (activeCount / totalCount) * 100;

    return (
        <div className="renaissance-panel p-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-lg overflow-hidden relative">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-slate-300 uppercase tracking-[0.2em]">Neural Pulse</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400/80">
                    {vitality.toFixed(0)}% VITALITY
                </div>
            </div>

            <div className="flex items-end gap-1 h-12">
                {[...Array(11)].map((_, i) => {
                    const agent = agents[i];
                    const isActive = agent && agent.status !== 'OFFLINE';
                    const isExecuting = agent && agent.status === 'EXECUTING';

                    return (
                        <motion.div
                            key={i}
                            initial={{ height: 4 }}
                            animate={{ 
                                height: isActive ? (isExecuting ? [8, 24, 8] : [4, 12, 4]) : 4,
                                backgroundColor: isActive ? (isExecuting ? "#818cf8" : "#10b981") : "#334155"
                            }}
                            transition={{ 
                                repeat: Infinity, 
                                duration: isExecuting ? 0.5 : 1.5,
                                delay: i * 0.1 
                            }}
                            className="flex-1 rounded-t-sm"
                        />
                    );
                })}
            </div>

            <div className="mt-2 flex justify-between text-[8px] font-mono text-slate-400 uppercase">
                <span>Core Nodes</span>
                <span>Swarm Edge</span>
            </div>

            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-neural-grid" />
        </div>
    );
};
