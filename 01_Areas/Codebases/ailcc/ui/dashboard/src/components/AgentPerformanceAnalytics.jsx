import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle, XCircle, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { cortexAPI } from '../services/cortexAPI';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 relative overflow-hidden">
        <div className={clsx("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10", color)} />
        <div className="flex items-start justify-between mb-2">
            <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center", color.replace('bg-', 'bg-').replace('/10', '/20'))}>
                <Icon className={clsx("w-5 h-5", color.replace('bg-', 'text-'))} />
            </div>
        </div>
        <div className="text-2xl font-bold font-orbitron mb-1">{value}</div>
        <div className="text-xs text-slate-500 font-mono">{title}</div>
        {subtitle && <div className="text-[10px] text-slate-600 mt-1">{subtitle}</div>}
    </div>
);

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0a0a10] border border-white/20 rounded-lg p-3 shadow-xl">
                <p className="text-xs text-slate-400 mb-2">{payload[0].payload.date}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-xs font-mono" style={{ color: entry.color }}>
                        {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const AgentPerformanceAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [trends, setTrends] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [timeRange, setTimeRange] = useState(7);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
        const interval = setInterval(loadAnalytics, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [timeRange, selectedAgent]);

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            // Load overall analytics
            const analyticsData = await cortexAPI.getAnalytics(timeRange);
            setAnalytics(analyticsData);

            // Load trends
            const trendsData = await cortexAPI.getAnalyticsTrends(selectedAgent, timeRange);
            setTrends(trendsData.trends || []);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !analytics) {
        return (
            <div className="glass-panel rounded-2xl p-6 flex items-center justify-center h-full">
                <div className="text-slate-500 text-sm font-mono animate-pulse">Loading analytics...</div>
            </div>
        );
    }

    const globalStats = analytics?.global_stats || {};
    const agents = analytics?.agents || [];

    return (
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                <h2 className="text-sm font-bold flex items-center gap-2 font-orbitron tracking-widest text-purple-400">
                    <BarChart3 className="w-4 h-4" /> AGENT PERFORMANCE
                </h2>
                <div className="flex gap-2">
                    {[7, 14, 30].map(days => (
                        <button
                            key={days}
                            onClick={() => setTimeRange(days)}
                            className={clsx(
                                "px-2 py-1 text-[10px] rounded font-mono transition-all",
                                timeRange === days
                                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                                    : "bg-white/5 text-slate-500 hover:text-white"
                            )}
                        >
                            {days}D
                        </button>
                    ))}
                </div>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <StatCard
                    title="TOTAL TASKS"
                    value={globalStats.total_tasks_completed || 0}
                    subtitle={`${globalStats.total_tasks_failed || 0} failed`}
                    icon={CheckCircle}
                    color="bg-green-500"
                />
                <StatCard
                    title="SUCCESS RATE"
                    value={`${(globalStats.success_rate || 0).toFixed(1)}%`}
                    subtitle="Task completion"
                    icon={TrendingUp}
                    color="bg-cyan-500"
                />
                <StatCard
                    title="AVG RESPONSE"
                    value={`${(globalStats.avg_response_time_ms || 0).toFixed(0)}ms`}
                    subtitle="Response time"
                    icon={Clock}
                    color="bg-yellow-500"
                />
                <StatCard
                    title="ACTIVE AGENTS"
                    value={globalStats.total_agents || 0}
                    subtitle="With analytics"
                    icon={Activity}
                    color="bg-purple-500"
                />
            </div>

            {/* Performance Trends Chart */}
            {trends.length > 0 && (
                <div className="mb-6">
                    <div className="text-xs text-slate-400 font-mono mb-2">PERFORMANCE TRENDS
                    </div>
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(value) => value.slice(5)} // MM-DD
                                />
                                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                                <Line
                                    type="monotone"
                                    dataKey="avg_duration_ms"
                                    stroke="#a78bfa"
                                    strokeWidth={2}
                                    name="Avg Duration (ms)"
                                    dot={{ r: 3 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="success_rate"
                                    stroke="#34d399"
                                    strokeWidth={2}
                                    name="Success Rate (%)"
                                    dot={{ r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Agent Performance Table */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="text-xs text-slate-400 font-mono mb-2">AGENT BREAKDOWN</div>
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="space-y-2">
                        {agents.map((agent, idx) => (
                            <motion.div
                                key={agent.agent_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => setSelectedAgent(selectedAgent === agent.agent_id ? null : agent.agent_id)}
                                className={clsx(
                                    "bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all cursor-pointer",
                                    selectedAgent === agent.agent_id && "border-purple-500/50 bg-purple-500/10"
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs font-mono text-white font-bold">{agent.agent_id}</div>
                                        {selectedAgent === agent.agent_id && (
                                            <div className="text-[8px] px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded font-mono">SELECTED</div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px]">
                                        <div className="flex items-center gap-1 text-green-400">
                                            <CheckCircle className="w-3 h-3" />
                                            {agent.tasks_completed}
                                        </div>
                                        {agent.tasks_failed > 0 && (
                                            <div className="flex items-center gap-1 text-red-400">
                                                <XCircle className="w-3 h-3" />
                                                {agent.tasks_failed}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                                    <div>
                                        <span className="text-slate-600">Avg Response:</span>{' '}
                                        <span className="text-cyan-400 font-mono">{agent.avg_response_time_ms.toFixed(0)}ms</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-600">Task Types:</span>{' '}
                                        <span className="text-slate-400">{Object.keys(agent.task_types || {}).length}</span>
                                    </div>
                                </div>

                                {/* Task Types Breakdown */}
                                {selectedAgent === agent.agent_id && Object.keys(agent.task_types || {}).length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <div className="text-[10px] text-slate-500 mb-2">TASK TYPE BREAKDOWN</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(agent.task_types).map(([type, data]) => (
                                                <div key={type} className="bg-white/5 rounded p-2">
                                                    <div className="text-[10px] text-slate-400 capitalize mb-1">{type}</div>
                                                    <div className="flex items-center justify-between text-[9px]">
                                                        <span className="text-white">{data.count} tasks</span>
                                                        <span className="text-cyan-400">{data.avg_duration_ms.toFixed(0)}ms</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {agents.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                            <BarChart3 className="w-8 h-8 opacity-20" />
                            <span className="text-xs font-mono">NO ANALYTICS DATA YET</span>
                            <span className="text-[10px] text-slate-700">Task completions will appear here</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
