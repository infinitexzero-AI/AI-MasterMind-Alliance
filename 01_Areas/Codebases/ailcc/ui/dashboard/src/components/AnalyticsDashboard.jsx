import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Zap, Activity } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cortexAPI } from '../services/cortexAPI';

export const AnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState({
        system_status: 'ONLINE',
        uptime_seconds: 0,
        total_activities: 0,
        intel_processed: 0,
        files_analyzed: 0,
        tasks_created: 0,
        nav_requests: 0
    });

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const data = await cortexAPI.getAnalytics();
                setAnalytics(data);
            } catch (error) {
                console.error('Failed to load analytics:', error);
            }
        };

        loadAnalytics();
        const interval = setInterval(loadAnalytics, 3000);
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours}h ${minutes}m ${secs}s`;
    };

    const activityData = [
        { name: 'Intel', value: analytics.intel_processed, color: '#bc13fe' },
        { name: 'Files', value: analytics.files_analyzed, color: '#00f3ff' },
        { name: 'Tasks', value: analytics.tasks_created, color: '#fcee0a' },
        { name: 'Nav', value: analytics.nav_requests, color: '#05ffa1' }
    ];

    return (
        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6 h-full">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h2 className="text-sm font-bold flex items-center gap-2 font-orbitron tracking-widest text-yellow-400">
                    <BarChart3 className="w-4 h-4" /> ANALYTICS
                </h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-slate-500 text-xs font-mono mb-1">SYSTEM STATUS</div>
                    <div className={`text-xl font-bold font-orbitron ${analytics.system_status === 'ONLINE' ? 'text-green-400' : 'text-red-500'}`}>
                        {analytics.system_status}
                    </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-slate-500 text-xs font-mono mb-1">UPTIME</div>
                    <div className="text-xl font-bold text-cyan-400 font-orbitron">
                        {formatUptime(analytics.uptime_seconds)}
                    </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-slate-500 text-xs font-mono mb-1">TOTAL ACTIVITIES</div>
                    <div className="text-xl font-bold text-purple-400 font-orbitron">
                        {analytics.total_activities}
                    </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-slate-500 text-xs font-mono mb-1">INTEL PROCESSED</div>
                    <div className="text-xl font-bold text-yellow-400 font-orbitron">
                        {analytics.intel_processed}
                    </div>
                </div>
            </div>

            {/* Activity Breakdown */}
            <div className="flex-1 bg-black/20 rounded-xl p-4 border border-white/5">
                <div className="text-xs text-slate-400 font-mono mb-3">ACTIVITY BREAKDOWN</div>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0a0a14',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {activityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-cyan-400 font-mono mb-1">FILES</div>
                    <div className="text-lg font-bold text-cyan-400 font-orbitron">{analytics.files_analyzed}</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-yellow-400 font-mono mb-1">TASKS</div>
                    <div className="text-lg font-bold text-yellow-400 font-orbitron">{analytics.tasks_created}</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-green-400 font-mono mb-1">NAV</div>
                    <div className="text-lg font-bold text-green-400 font-orbitron">{analytics.nav_requests}</div>
                </div>
            </div>
        </div>
    );
};
