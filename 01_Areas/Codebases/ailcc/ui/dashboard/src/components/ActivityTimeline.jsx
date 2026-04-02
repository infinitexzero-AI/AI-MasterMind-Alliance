import { useState, useEffect } from 'react';
import { Activity, FileText, Brain, Compass, AlertTriangle, MessageSquare, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { cortexAPI } from '../services/cortexAPI';

const ActivityTypeIcon = ({ type }) => {
    const icons = {
        'INTEL_IN': Brain,
        'MOBILE_IN': MessageSquare,
        'FILED': FileText,
        'ESCALATED': AlertTriangle,
        'NAVIGATING': Compass,
        'NAV_COMPLETE': Compass,
        'CHAT': MessageSquare,
        'API_CMD': Zap,
        'DRIVE_SCAN': Activity
    };

    const Icon = icons[type] || Activity;
    return <Icon className="w-4 h-4" />;
};

const ActivityTypeColor = (type) => {
    const colors = {
        'INTEL_IN': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        'MOBILE_IN': 'text-pink-400 bg-pink-500/10 border-pink-500/30',
        'FILED': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        'ESCALATED': 'text-red-400 bg-red-500/10 border-red-500/30',
        'NAVIGATING': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        'NAV_COMPLETE': 'text-green-400 bg-green-500/10 border-green-500/30',
        'CHAT': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
        'API_CMD': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
        'DRIVE_SCAN': 'text-teal-400 bg-teal-500/10 border-teal-500/30'
    };

    return colors[type] || 'text-slate-400 bg-slate-500/10 border-slate-500/30';
};

export const ActivityTimeline = ({ limit = 20 }) => {
    const [activities, setActivities] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        // Initial load
        const loadActivities = async () => {
            try {
                const data = await cortexAPI.getRecentActivity(limit);
                setActivities(data.activities || []);
            } catch (error) {
                console.error('Failed to load activities:', error);
            }
        };

        loadActivities();

        // Poll for updates every 2 seconds
        const interval = setInterval(loadActivities, 2000);
        return () => clearInterval(interval);
    }, [limit]);

    const filteredActivities = filter === 'ALL'
        ? activities
        : activities.filter(a => a.action === filter);

    const filterOptions = ['ALL', 'INTEL_IN', 'MOBILE_IN', 'ESCALATED', 'NAVIGATING', 'CHAT', 'FILED'];

    return (
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                <h2 className="text-sm font-bold flex items-center gap-2 font-orbitron tracking-widest text-cyan-400">
                    <Activity className="w-4 h-4" /> ACTIVITY TIMELINE
                </h2>
                <div className="flex gap-2">
                    {filterOptions.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={clsx(
                                "px-2 py-1 text-[10px] rounded font-mono transition-all",
                                filter === f
                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                                    : "bg-white/5 text-slate-500 hover:text-white"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                <AnimatePresence mode="popLayout">
                    {filteredActivities.map((activity, idx) => (
                        <motion.div
                            key={activity.timestamp || idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={clsx(
                                "p-3 rounded-xl border cursor-pointer transition-all",
                                ActivityTypeColor(activity.action),
                                expandedId === idx ? "ring-1 ring-cyan-500/50" : ""
                            )}
                            onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className="flex-shrink-0 mt-0.5">
                                    <ActivityTypeIcon type={activity.action} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <span className="text-[10px] font-bold font-orbitron tracking-wider">
                                            {activity.action}
                                        </span>
                                        <span className="text-[10px] text-slate-600 font-mono flex-shrink-0">
                                            {activity.time}
                                        </span>
                                    </div>
                                    <p className={clsx(
                                        "text-xs text-slate-300 font-mono leading-relaxed",
                                        expandedId === idx ? "" : "truncate"
                                    )}>
                                        {activity.detail}
                                    </p>

                                    {/* Expanded Details */}
                                    {expandedId === idx && activity.timestamp && (
                                        <div className="mt-2 pt-2 border-t border-white/10">
                                            <p className="text-[10px] text-slate-500 font-mono">
                                                Full timestamp: {activity.timestamp}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredActivities.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                        <Activity className="w-8 h-8 opacity-20" />
                        <span className="text-xs font-mono">NO ACTIVITY DETECTED</span>
                    </div>
                )}
            </div>
        </div>
    );
};
