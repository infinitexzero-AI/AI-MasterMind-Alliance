import React from 'react';
import { motion } from 'framer-motion';

interface AgentHeatmapProps {
    metrics: Record<string, {
        successRate: number;
        activeTasks: number;
        latency: number;
    }>;
}

const AgentHeatmap: React.FC<AgentHeatmapProps> = ({ metrics }) => {
    const agents = Object.keys(metrics);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {agents.map((agent, index) => {
                const data = metrics[agent];
                const healthColor = data.successRate > 0.9 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    data.successRate > 0.7 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30';

                return (
                    <motion.div
                        key={agent}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-2xl backdrop-blur-md border shadow-lg flex flex-col gap-2 ${healthColor}`}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold uppercase tracking-tighter">{agent}</span>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${data.activeTasks > 0 ? 'bg-blue-400' : 'bg-gray-500'}`} />
                        </div>

                        <div className="flex flex-col gap-1 mt-2">
                            <div className="flex justify-between text-[10px]">
                                <span>RELIBILITY</span>
                                <span>{(data.successRate * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data.successRate * 100}%` }}
                                    className="h-full bg-current"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-end mt-2">
                            <div className="flex flex-col">
                                <span className="text-lg font-mono font-bold leading-none">{data.latency}ms</span>
                                <span className="text-[9px] opacity-60">AVG LATENCY</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-lg font-mono font-bold leading-none">{data.activeTasks}</span>
                                <span className="text-[9px] opacity-60">LOAD</span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default AgentHeatmap;
