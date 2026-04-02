import React from 'react';
import { useSystemHealth } from './hooks/useSystemHealth';
import StatusIndicator from './StatusIndicator';
import { Server, Zap, Layers, Database } from 'lucide-react';

export function MissionControlGrid() {
    const {
        health,
        isLoading,
        isConnected,
        coreStatus,
        redisStatus,
        bullStatus,
        totalAgents,
        activeSessions,
        totalFailed,
        queueMetrics
    } = useSystemHealth();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 renaissance-panel animate-pulse bg-slate-900/50" />
                ))}
            </div>
        );
    }

    if (!isConnected || !health) {
        return (
            <div className="grid grid-cols-1 mb-6">
                <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg flex items-center gap-3">
                    <StatusIndicator status="unhealthy" pulse={false} />
                    <span className="text-red-400 font-bold">SYSTEM UPLINK LOST: Unable to reach Valentine Core</span>
                </div>
            </div>
        );
    }

    const { core } = health.services;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in">
            {/* Core Status Card */}
            <div className="renaissance-panel p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-cyan-500/20" />
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase tracking-widest">
                        <Server className="w-3 h-3 text-cyan-400" /> Core
                    </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <StatusIndicator status={coreStatus} label={coreStatus === 'healthy' ? 'ONLINE' : 'OFFLINE'} />
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-2">
                    VER: v{core.version} // UP: {(core.uptime / 60).toFixed(1)}m
                </div>
            </div>

            {/* Active Agents Card */}
            <div className="renaissance-panel p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-purple-500/20" />
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase tracking-widest">
                        <Zap className="w-3 h-3 text-purple-400" /> Active Agents
                    </div>
                </div>
                <div className="text-3xl font-bold text-slate-100 mb-1">
                    {totalAgents}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                    {activeSessions} ACTIVE SESSIONS
                </div>
            </div>

            {/* Queue Health Card */}
            <div className="renaissance-panel p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-emerald-500/20" />
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase tracking-widest">
                        <Layers className="w-3 h-3 text-emerald-400" /> Queues
                    </div>
                    <StatusIndicator status={bullStatus} />
                </div>
                <div className="flex gap-1 mt-2 h-8 items-end">
                    {['high_priority', 'automation', 'research'].map(q => {
                        const count = queueMetrics[q]?.active || 0;
                        const height = Math.min(100, Math.max(10, count * 20));
                        return (
                            <div key={q} className="flex-1 flex flex-col justify-end group/bar" title={`${q}: ${count} active`}>
                                <div
                                    className={`w-full ${count > 0 ? 'bg-emerald-500/60' : 'bg-slate-700/30'} rounded-t transition-all duration-500`}
                                    style={{ height: `${height}%` }}
                                />
                                <div className="h-0.5 w-full bg-emerald-500/20" />
                            </div>
                        )
                    })}
                </div>
                <div className="flex justify-between mt-1 text-[8px] text-slate-400 font-mono uppercase">
                    <span>PRIO</span>
                    <span>AUTO</span>
                    <span>RSRCH</span>
                </div>
            </div>

            {/* Infra/Redis Card */}
            <div className="renaissance-panel p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-amber-500/20" />
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase tracking-widest">
                        <Database className="w-3 h-3 text-amber-400" /> Infra
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-mono">REDIS</span>
                        <StatusIndicator status={redisStatus} pulse={false} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-mono">BULL</span>
                        <StatusIndicator status={bullStatus} pulse={false} />
                    </div>
                </div>
            </div>
        </div>
    );
}
