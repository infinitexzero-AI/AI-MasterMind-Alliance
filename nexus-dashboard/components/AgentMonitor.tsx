import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Agent, AgentMonitorProps } from '../types/DashboardInterfaces';
import { Activity, Cpu, Wifi, WifiOff } from 'lucide-react';

const AgentMonitorBase: React.FC<AgentMonitorProps> = ({
    agents,
    onAgentSelect,
    networkStatus
}) => {

    // Group agents by status for potentially different visual treatments, though a simple grid is often best
    const activeAgents = agents.filter(a => a.status !== 'OFFLINE');
    const offlineAgents = agents.filter(a => a.status === 'OFFLINE');

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                <h2 className="text-cyan-400 font-mono text-sm uppercase tracking-wider flex items-center gap-2">
                    <Activity size={16} />
                    Active Swarm
                </h2>
                <div className={`flex items-center gap-2 text-xs font-mono px-2 py-1 rounded ${networkStatus === 'CONNECTED' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                    }`}>
                    {networkStatus === 'CONNECTED' ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {networkStatus}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence>
                    {activeAgents.map((agent) => (
                        <AgentCard
                            key={agent.id}
                            agent={agent}
                            onClick={() => onAgentSelect(agent.id)}
                        />
                    ))}
                    {offlineAgents.map((agent) => (
                        <AgentCard
                            key={agent.id}
                            agent={agent}
                            onClick={() => onAgentSelect(agent.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {agents.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-slate-400 font-mono text-xs">
                    WAITING FOR ROSTER...
                </div>
            )}
        </div>
    );
};

export const AgentMonitor = React.memo(AgentMonitorBase);
AgentMonitor.displayName = 'AgentMonitor';

const AgentCard = ({ agent, onClick }: { agent: Agent; onClick: () => void }) => {
    const isExecuting = agent.status === 'EXECUTING';
    const isOffline = agent.status === 'OFFLINE';
    const throughput = agent.throughput ?? 0;

    // Quantum Glass Pulse Effect - Dynamic based on throughput
    // Overclock mode (>80): Faster, intense cyan glow
    // Normal mode: Subtle breathing pulse
    const isOverclock = throughput > 80;
    const pulseIntensity = Math.min(throughput / 100, 1);
    const pulseDuration = isOverclock ? 0.6 : 2.5 - (pulseIntensity * 1.5); // 0.6s (overclock) to 2.5s (idle)
    const glowOpacity = isOverclock ? 0.5 : 0.15 + (pulseIntensity * 0.2);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isOffline ? 0.5 : 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.02, borderColor: '#22d3ee' }}
            onClick={onClick}
            className={`
                relative p-3 rounded border cursor-pointer transition-all duration-300 overflow-hidden
                ${isExecuting
                    ? 'bg-indigo-900/20 border-indigo-500/50'
                    : 'bg-slate-900/80 border-slate-700/50 hover:bg-slate-800'}
            `}
        >
            {/* Quantum Glass Background Pulse Layer */}
            {throughput > 0 && (
                <motion.div
                    animate={{
                        opacity: [0, glowOpacity, 0],
                        scale: [1, isOverclock ? 1.02 : 1.005, 1],
                    }}
                    transition={{
                        duration: pulseDuration,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className={`absolute inset-0 rounded pointer-events-none ${
                        isOverclock
                            ? 'bg-gradient-to-br from-cyan-500/20 via-cyan-400/10 to-transparent'
                            : 'bg-gradient-to-br from-cyan-500/5 to-transparent'
                    }`}
                    style={{
                        boxShadow: isOverclock
                            ? `inset 0 0 ${20 + (pulseIntensity * 30)}px rgba(34, 211, 238, ${0.3 + pulseIntensity * 0.3}),
                               0 0 ${15 + (pulseIntensity * 25)}px rgba(34, 211, 238, ${0.15 + pulseIntensity * 0.2})`
                            : `inset 0 0 ${10 + (pulseIntensity * 15)}px rgba(34, 211, 238, ${0.05 + pulseIntensity * 0.1})`
                    }}
                />
            )}

            {/* Overclock Ring Effect */}
            {isOverclock && (
                <motion.div
                    animate={{
                        opacity: [0.3, 0.7, 0.3],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded pointer-events-none border-2 border-cyan-400/40"
                    style={{
                        boxShadow: '0 0 30px rgba(34, 211, 238, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.2)'
                    }}
                />
            )}

            {/* Status Pulse for Executing Agents */}
            {isExecuting && (
                <span className="absolute top-2 right-2 flex h-2 w-2 z-10">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
            )}

            {/* Online/Offline Dot */}
            {!isExecuting && (
                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full z-10 ${agent.status === 'IDLE' ? 'bg-emerald-500/50' :
                    agent.status === 'OFFLINE' ? 'bg-slate-600' : 'bg-amber-500'
                    }`} />
            )}

            <div className="flex flex-col gap-1 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <Cpu size={14} className={isOverclock ? "text-cyan-400 animate-pulse" : isExecuting ? "text-indigo-400" : "text-slate-400"} />
                    <span className={`font-bold text-sm ${isOverclock ? 'text-cyan-300' : isExecuting ? 'text-indigo-200' : 'text-slate-300'}`}>
                        {agent.name}
                    </span>
                    {isOverclock && (
                        <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider animate-pulse">
                            Overclock
                        </span>
                    )}
                </div>

                <div className="flex justify-between items-end border-b border-slate-800/50 pb-2">
                    <span className="text-[10px] uppercase text-cyan-500/70 font-mono tracking-widest font-bold">
                        {agent.role}
                    </span>
                    {throughput !== undefined && throughput > 0 && (
                        <div className="flex gap-0.5 h-2 items-end mb-0.5">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0.5 }}
                                    animate={{
                                        opacity: throughput / 20 > i ? 1 : 0.3,
                                        scaleY: throughput / 20 > i ? [1, 1.2, 1] : 1
                                    }}
                                    transition={{
                                        duration: isOverclock ? 0.3 : 0.8,
                                        repeat: isOverclock ? Infinity : 0,
                                        ease: "easeInOut"
                                    }}
                                    className={`w-1 rounded-t-sm transition-all duration-500 ${throughput / 20 > i
                                            ? isOverclock
                                                ? 'bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                                                : 'bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.5)]'
                                            : 'bg-slate-800'
                                        }`}
                                    style={{ height: `${(i + 1) * 20}%` }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Skills Tags */}
                {agent.skills && agent.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {agent.skills.map(skill => (
                            <span key={skill} className="text-[8px] font-mono px-1.5 py-0.5 rounded-md bg-slate-800/50 text-slate-400 border border-slate-700/50 uppercase tracking-tighter">
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {agent.currentTask && (
                    <div className="mt-2 text-[10px] text-cyan-200 bg-cyan-950/40 px-2 py-1 rounded truncate border border-cyan-500/20 font-mono tracking-wide relative overflow-hidden group/task">
                        <span className="opacity-50 mr-2">{'>'}</span>{agent.currentTask}
                        {/* Task Significance Glow */}
                        {agent.significance !== undefined && (
                            <div
                                className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-cyan-400 to-transparent transition-all duration-1000"
                                style={{ width: `${agent.significance}%` }}
                            />
                        )}
                    </div>
                )}

                <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-2">
                        {agent.significance !== undefined && (
                            <span className="text-[8px] font-mono text-cyan-500/50 uppercase">
                                SIG: <span className="text-cyan-400">{agent.significance}%</span>
                            </span>
                        )}
                        {/* Throughput indicator */}
                        {throughput > 0 && (
                            <span className="text-[8px] font-mono uppercase">
                                <span className={isOverclock ? 'text-cyan-400' : 'text-slate-500'}>
                                    TP: <span className={isOverclock ? 'text-cyan-300 font-bold' : 'text-cyan-400'}>{throughput}%</span>
                                </span>
                            </span>
                        )}
                    </div>
                    {/* Cost Session if > 0 */}
                    {agent.costSession > 0 && (
                        <div className="text-[9px] font-mono text-emerald-500/80">
                            ${agent.costSession.toFixed(4)}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
