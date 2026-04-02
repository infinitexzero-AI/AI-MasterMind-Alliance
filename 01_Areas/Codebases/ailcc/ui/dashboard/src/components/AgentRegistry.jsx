import { useState, useEffect } from 'react';
import { Users, Smartphone, Monitor, Globe, Activity, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { cortexAPI } from '../services/cortexAPI';

const PlatformIcon = ({ platform }) => {
    const icons = {
        'Mobile': Smartphone,
        'Desktop': Monitor,
        'Browser': Globe,
        'Background': Activity
    };
    const Icon = icons[platform] || Activity;
    return <Icon className="w-4 h-4" />;
};

const StatusBadge = ({ status }) => {
    const colors = {
        'active': 'bg-green-500/20 text-green-400 border-green-500/50',
        'idle': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        'offline': 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    };
    return (
        <span className={clsx('px-2 py-0.5 text-[10px] rounded-full font-mono border', colors[status] || colors.offline)}>
            {status?.toUpperCase() || 'OFFLINE'}
        </span>
    );
};

export const AgentRegistry = () => {
    const [registry, setRegistry] = useState({ agents: [], stats: {} });
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const loadAgents = async () => {
            try {
                const data = await cortexAPI.getAgents();
                setRegistry(data);
            } catch (error) {
                console.error('Failed to load agents:', error);
            }
        };

        loadAgents();
        const interval = setInterval(loadAgents, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, []);

    const filteredAgents = filter === 'ALL'
        ? registry.agents
        : registry.agents.filter(a => a.platform === filter);

    const platformFilters = ['ALL', 'Mobile', 'Desktop', 'Browser', 'Background'];

    const formatTimestamp = (isoString) => {
        if (!isoString) return 'Never';
        const date = new Date(isoString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                <h2 className="text-sm font-bold flex items-center gap-2 font-orbitron tracking-widest text-purple-400">
                    <Users className="w-4 h-4" /> AGENT REGISTRY
                </h2>
                <div className="flex gap-2">
                    {platformFilters.map(p => (
                        <button
                            key={p}
                            onClick={() => setFilter(p)}
                            className={clsx(
                                "px-2 py-1 text-[10px] rounded font-mono transition-all",
                                filter === p
                                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                                    : "bg-white/5 text-slate-500 hover:text-white"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                    <div className="text-[10px] text-slate-500 font-mono mb-1">TOTAL</div>
                    <div className="text-xl font-bold text-white font-orbitron">{registry.stats.total_agents || 0}</div>
                </div>
                <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-center">
                    <div className="text-[10px] text-green-400 font-mono mb-1">ACTIVE</div>
                    <div className="text-xl font-bold text-green-400 font-orbitron">{registry.stats.active_agents || 0}</div>
                </div>
                <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 text-center">
                    <div className="text-[10px] text-yellow-400 font-mono mb-1">IDLE</div>
                    <div className="text-xl font-bold text-yellow-400 font-orbitron">{registry.stats.idle_agents || 0}</div>
                </div>
            </div>

            {/* Agent List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                <AnimatePresence mode="popLayout">
                    {filteredAgents.map((agent, idx) => (
                        <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 transition-all"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={clsx(
                                        "p-1.5 rounded-lg",
                                        agent.status === 'active' ? "bg-green-500/20" : "bg-slate-500/20"
                                    )}>
                                        <PlatformIcon platform={agent.platform} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white font-mono">{agent.name}</h3>
                                        <p className="text-[10px] text-slate-500 font-mono">{agent.id}</p>
                                    </div>
                                </div>
                                <StatusBadge status={agent.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div className="text-[10px]">
                                    <span className="text-slate-500">Platform:</span>
                                    <span className="text-cyan-400 ml-1 font-mono">{agent.platform}</span>
                                </div>
                                <div className="text-[10px]">
                                    <span className="text-slate-500">Device:</span>
                                    <span className="text-white ml-1 font-mono">{agent.device}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-2">
                                <Clock className="w-3 h-3" />
                                <span>Last active: {formatTimestamp(agent.last_active)}</span>
                            </div>

                            {/* Session Data */}
                            {agent.session_data && (
                                <div className="grid grid-cols-4 gap-1 pt-2 border-t border-white/5">
                                    <div className="text-center">
                                        <div className="text-[9px] text-slate-600">Intel</div>
                                        <div className="text-xs font-bold text-purple-400">{agent.session_data.intel_contributed || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[9px] text-slate-600">Tasks</div>
                                        <div className="text-xs font-bold text-cyan-400">{agent.session_data.tasks_completed || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[9px] text-slate-600">Chats</div>
                                        <div className="text-xs font-bold text-yellow-400">{agent.session_data.conversations || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[9px] text-slate-600">Artifacts</div>
                                        <div className="text-xs font-bold text-green-400">{agent.session_data.artifacts_created || 0}</div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredAgents.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                        <Users className="w-8 h-8 opacity-20" />
                        <span className="text-xs font-mono">NO AGENTS REGISTERED</span>
                    </div>
                )}
            </div>
        </div>
    );
};
