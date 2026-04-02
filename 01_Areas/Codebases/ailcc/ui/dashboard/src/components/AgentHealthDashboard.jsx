import { useState, useEffect, useRef } from 'react';
import { Activity, Heart, AlertCircle, CheckCircle, Clock, Zap, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { cortexAPI } from '../services/cortexAPI';
import notificationService from '../services/notificationService';

const HealthBadge = ({ status }) => {
    const config = {
        'healthy': { color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: CheckCircle },
        'degraded': { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: AlertCircle },
        'unhealthy': { color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: AlertCircle }
    };
    const { color, icon: Icon } = config[status] || config.unhealthy;

    return (
        <span className={clsx('px-2 py-1 text-[10px] rounded-lg font-mono border flex items-center gap-1', color)}>
            <Icon className="w-3 h-3" />
            {status?.toUpperCase()}
        </span>
    );
};

const HealthScore = ({ score }) => {
    const getColor = () => {
        if (score >= 80) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getGradient = () => {
        if (score >= 80) return 'from-green-500/20 to-green-500/5';
        if (score >= 50) return 'from-yellow-500/20 to-yellow-500/5';
        return 'from-red-500/20 to-red-500/5';
    };

    return (
        <div className="relative">
            <div className={clsx("text-3xl font-bold font-orbitron", getColor())}>
                {score}
            </div>
            <div className={clsx("absolute inset-0 blur-xl bg-gradient-to-br -z-10", getGradient())} />
        </div>
    );
};

const AgentHealthCard = ({ agent, onPing, isSelected, onSelect }) => {
    const [pinging, setPinging] = useState(false);

    const handlePing = async () => {
        setPinging(true);
        try {
            await onPing(agent.agent_id);
        } finally {
            setTimeout(() => setPinging(false), 1000);
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return 'Never';
        const date = new Date(isoString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={clsx(
                "bg-white/5 border rounded-xl p-4 hover:bg-white/10 transition-all relative",
                isSelected ? "border-purple-500/50 bg-purple-500/5" : "border-white/10"
            )}
        >
            {/* Selection Checkbox */}
            <button
                onClick={() => onSelect(agent.agent_id)}
                className="absolute top-2 left-2 z-10"
            >
                {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-purple-400" />
                ) : (
                    <Square className="w-4 h-4 text-slate-500 hover:text-white" />
                )}
            </button>

            {/* Header with Name and Score */}
            <div className="flex justify-between items-start mb-3 ml-6">
                <div>
                    <h3 className="text-sm font-bold text-white font-mono mb-1">{agent.agent_name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">{agent.agent_id}</span>
                </div>
                <HealthScore score={agent.health_score} />
            </div>

            {/* Health Status Badge */}
            <div className="mb-3">
                <HealthBadge status={agent.health_status} />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
                <div className="bg-white/5 p-2 rounded">
                    <div className="text-slate-500 mb-1">Uptime</div>
                    <div className="text-white font-bold">{agent.uptime_percentage.toFixed(0)}%</div>
                </div>
                <div className="bg-white/5 p-2 rounded">
                    <div className="text-slate-500 mb-1">Response</div>
                    <div className="text-white font-bold">{agent.response_time_ms.toFixed(0)}ms</div>
                </div>
                <div className="bg-white/5 p-2 rounded">
                    <div className="text-slate-500 mb-1">Errors</div>
                    <div className={clsx("font-bold", agent.error_count > 0 ? "text-red-400" : "text-green-400")}>
                        {agent.error_count}
                    </div>
                </div>
                <div className="bg-white/5 p-2 rounded">
                    <div className="text-slate-500 mb-1">Platform</div>
                    <div className="text-cyan-400 font-bold capitalize">{agent.platform}</div>
                </div>
            </div>

            {/* Last Heartbeat */}
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-3">
                <Clock className="w-3 h-3" />
                <span>Last seen: {formatTime(agent.last_heartbeat)}</span>
            </div>

            {/* Ping Button */}
            <button
                onClick={handlePing}
                disabled={pinging}
                className={clsx(
                    "w-full py-2 rounded-lg text-[10px] font-mono font-bold transition-all",
                    pinging
                        ? "bg-purple-500/20 text-purple-400 animate-pulse"
                        : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30"
                )}
            >
                {pinging ? (
                    <span className="flex items-center justify-center gap-2">
                        <Zap className="w-3 h-3 animate-bounce" />
                        PINGING...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <Zap className="w-3 h-3" />
                        PING AGENT
                    </span>
                )}
            </button>
        </motion.div>
    );
};

export const AgentHealthDashboard = () => {
    const [healthData, setHealthData] = useState({ agents: [], summary: {} });
    const [filter, setFilter] = useState('ALL');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [bulkActionInProgress, setBulkActionInProgress] = useState(false);
    const previousHealthRef = useRef({});

    const loadHealth = async () => {
        try {
            const data = await cortexAPI.getAgentHealth();

            // Check for health changes and send notifications
            data.agents?.forEach(agent => {
                const prevStatus = previousHealthRef.current[agent.agent_id];
                const currentStatus = agent.health_status;

                if (prevStatus && prevStatus !== currentStatus) {
                    if (currentStatus === 'unhealthy' && prevStatus !== 'unhealthy') {
                        notificationService.agentUnhealthy(agent.agent_id, agent.health_score);
                    } else if (currentStatus === 'healthy' && prevStatus === 'unhealthy') {
                        notificationService.agentRecovered(agent.agent_id, agent.health_score);
                    }
                }

                previousHealthRef.current[agent.agent_id] = currentStatus;
            });

            setHealthData(data);
        } catch (error) {
            console.error('Failed to load health data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadHealth();
        const interval = setInterval(loadHealth, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, []);

    const handlePing = async (agentId) => {
        try {
            await cortexAPI.pingAgent(agentId);
            await loadHealth(); // Refresh after ping
        } catch (error) {
            console.error('Failed to ping agent:', error);
        }
    };

    const toggleSelection = (agentId) => {
        setSelectedAgents(prev =>
            prev.includes(agentId)
                ? prev.filter(id => id !== agentId)
                : [...prev, agentId]
        );
    };

    const selectAll = () => {
        const allIds = filteredAgents?.map(a => a.agent_id) || [];
        setSelectedAgents(allIds);
    };

    const clearSelection = () => {
        setSelectedAgents([]);
    };

    const handleBulkPing = async () => {
        if (selectedAgents.length === 0) return;
        setBulkActionInProgress(true);
        try {
            await cortexAPI.bulkPingAgents(selectedAgents);
            await loadHealth();
        } catch (error) {
            console.error('Bulk ping failed:', error);
        } finally {
            setBulkActionInProgress(false);
        }
    };

    const handleBulkResetErrors = async () => {
        if (selectedAgents.length === 0) return;
        if (!confirm(`Reset errors for ${selectedAgents.length} agents?`)) return;
        setBulkActionInProgress(true);
        try {
            await cortexAPI.bulkResetErrors(selectedAgents);
            await loadHealth();
        } catch (error) {
            console.error('Bulk reset failed:', error);
        } finally {
            setBulkActionInProgress(false);
        }
    };

    const filteredAgents = filter === 'ALL'
        ? healthData.agents
        : filter === 'UNHEALTHY'
            ? healthData.agents?.filter(a => a.health_status === 'unhealthy')
            : filter === 'DEGRADED'
                ? healthData.agents?.filter(a => a.health_status === 'degraded')
                : healthData.agents?.filter(a => a.platform === filter.toLowerCase());

    const filters = ['ALL', 'desktop', 'mobile', 'browser', 'background', 'UNHEALTHY', 'DEGRADED'];

    return (
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                <h2 className="text-sm font-bold flex items-center gap-2 font-orbitron tracking-widest text-green-400">
                    <Heart className="w-4 h-4" /> AGENT HEALTH
                </h2>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                    <div className="text-[10px] text-slate-500 font-mono mb-1">TOTAL</div>
                    <div className="text-xl font-bold text-white font-orbitron">{healthData.summary.total || 0}</div>
                </div>
                <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-center">
                    <div className="text-[10px] text-green-400 font-mono mb-1">HEALTHY</div>
                    <div className="text-xl font-bold text-green-400 font-orbitron">{healthData.summary.healthy || 0}</div>
                </div>
                <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 text-center">
                    <div className="text-[10px] text-yellow-400 font-mono mb-1">DEGRADED</div>
                    <div className="text-xl font-bold text-yellow-400 font-orbitron">{healthData.summary.degraded || 0}</div>
                </div>
                <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">
                    <div className="text-[10px] text-red-400 font-mono mb-1">UNHEALTHY</div>
                    <div className="text-xl font-bold text-red-400 font-orbitron">{healthData.summary.unhealthy || 0}</div>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedAgents.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-mono text-purple-400">
                                {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
                            </span>
                            <button
                                onClick={clearSelection}
                                className="text-[10px] text-slate-400 hover:text-white font-mono"
                            >
                                CLEAR
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={selectAll}
                                className="px-3 py-1 text-[10px] rounded font-mono bg-white/5 text-slate-400 hover:text-white transition-all"
                            >
                                SELECT ALL
                            </button>
                            <button
                                onClick={handleBulkPing}
                                disabled={bulkActionInProgress}
                                className="px-3 py-1 text-[10px] rounded font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30 disabled:opacity-50 transition-all flex items-center gap-1"
                            >
                                <Zap className="w-3 h-3" />
                                PING ALL
                            </button>
                            <button
                                onClick={handleBulkResetErrors}
                                disabled={bulkActionInProgress}
                                className="px-3 py-1 text-[10px] rounded font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30 disabled:opacity-50 transition-all"
                            >
                                RESET ERRORS
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={clsx(
                            "px-2 py-1 text-[10px] rounded font-mono transition-all",
                            filter === f
                                ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                : "bg-white/5 text-slate-500 hover:text-white"
                        )}
                    >
                        {f.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Agent Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center flex-1">
                    <div className="text-slate-500 text-sm font-mono animate-pulse">Loading health data...</div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        <AnimatePresence mode="popLayout">
                            {filteredAgents?.map((agent) => (
                                <AgentHealthCard
                                    key={agent.agent_id}
                                    agent={agent}
                                    onPing={handlePing}
                                    isSelected={selectedAgents.includes(agent.agent_id)}
                                    onSelect={toggleSelection}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {(!filteredAgents || filteredAgents.length === 0) && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                            <Activity className="w-8 h-8 opacity-20" />
                            <span className="text-xs font-mono">NO AGENTS MATCH FILTER</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
