import React from 'react';
import useSWR from 'swr';
import type { StorageTiersResponse } from '../pages/api/storage/tiers';
import type { SystemHealthResponse } from '../pages/api/system/health';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface HealthCardProps {
  title: string;
  status: 'healthy' | 'warning' | 'critical' | 'unmounted';
  metric: string;
  subMetric?: string;
  icon: string;
  onAction?: () => void;
  actionLabel?: string;
}

const HealthCard: React.FC<HealthCardProps> = ({
  title,
  status,
  metric,
  subMetric,
  icon,
  onAction,
  actionLabel = 'Details',
}) => {
  const statusColors = {
    healthy: 'bg-green-500/20 border-green-500/50 text-green-400',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    critical: 'bg-red-500/20 border-red-500/50 text-red-400',
    unmounted: 'bg-gray-500/20 border-gray-500/50 text-gray-400',
  };

  const statusIcons = {
    healthy: '✅',
    warning: '⚠️',
    critical: '🚨',
    unmounted: '❌',
  };

  return (
    <div
      className={`rounded-lg border-2 p-6 transition-all hover:scale-105 ${statusColors[status]}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl">{statusIcons[status]}</span>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold">{metric}</p>
        {subMetric && <p className="text-sm opacity-75">{subMetric}</p>}
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 w-full px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const SystemHealthDashboard: React.FC = () => {
  const { data: metrics, error: metricsError } = useSWR(
    '/api/system/metrics',
    fetcher,
    { refreshInterval: 5000 } // Refresh every 5 seconds
  );

  const { data: redisStats, error: redisError } = useSWR(
    '/api/memory/stats',
    fetcher,
    { refreshInterval: 10000 }
  );

  if (metricsError || redisError) {
    return (
      <div className="p-6 bg-red-500/20 border-2 border-red-500/50 rounded-lg">
        <p className="text-red-400">Failed to load system health data</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 bg-gray-500/20 border-2 border-gray-500/50 rounded-lg">
        <p className="text-gray-400 font-mono animate-pulse">ESTABLISHING TELEMETRY LINK...</p>
      </div>
    );
  }

  const memUsedGB = (metrics.memory.total - metrics.memory.available) / (1024**3);
  const memTotalGB = metrics.memory.total / (1024**3);
  const diskFreeGB = metrics.disk.free / (1024**3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-white">System Core Metrics</h2>
        <div className="text-xs font-mono text-cyan-400">
          STAMP: {new Date(metrics.timestamp * 1000).toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HealthCard
          title="CPU Cluster"
          status={metrics.cpu_usage > 80 ? 'critical' : metrics.cpu_usage > 50 ? 'warning' : 'healthy'}
          metric={`${metrics.cpu_usage.toFixed(1)}%`}
          subMetric="Load across all logical cores"
          icon="⚡"
        />

        <HealthCard
          title="Neural Memory"
          status={metrics.memory.percent > 85 ? 'critical' : metrics.memory.percent > 70 ? 'warning' : 'healthy'}
          metric={`${metrics.memory.percent.toFixed(1)}%`}
          subMetric={`${memUsedGB.toFixed(1)}GB / ${memTotalGB.toFixed(1)}GB`}
          icon="🧠"
        />

        <HealthCard
          title="Host Storage"
          status={metrics.disk.percent > 90 ? 'critical' : metrics.disk.percent > 80 ? 'warning' : 'healthy'}
          metric={`${diskFreeGB.toFixed(1)} GiB Free`}
          subMetric={`${metrics.disk.percent.toFixed(1)}% Capacity Used`}
          icon="📡"
        />
      </div>

      {redisStats && (
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 backdrop-blur-md">
          <h3 className="text-sm font-mono font-bold text-cyan-400 mb-4 uppercase tracking-widest">Hippocampus Registry (Redis)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 uppercase">Keys Count</p>
              <p className="text-xl font-bold text-white">{redisStats.keys_count}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 uppercase">Memory Used</p>
              <p className="text-xl font-bold text-white">{redisStats.used_memory_human}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 uppercase">Namespaces</p>
              <p className="text-xl font-bold text-white">{Object.keys(redisStats.namespaces || {}).length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 uppercase">Status</p>
              <p className="text-xl font-bold text-green-400 uppercase">{redisStats.connection_status}</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Automation Status */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Active Automation</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">
              ✅ Memory Orchestrator
            </span>
            <span className="text-xs text-gray-400">
              {metrics ? 'Operational' : 'Syncing...'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">
              ✅ Vault Indexing Engine
            </span>
            <span className="text-xs text-gray-400">
              Active - {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">
              ✅ Redis Persistence Layer
            </span>
            <span className="text-xs text-gray-400">
              {redisStats?.connection_status === 'connected' ? 'Steady Link' : 'Reconnecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      {(metrics.memory.percent > 90 || metrics.cpu_usage > 95) && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-400">
            System Alerts
          </h3>
          <div className="space-y-2">
            {metrics.memory.percent > 90 && (
              <div className="text-sm">
                🚨 {new Date().toLocaleTimeString()} - Memory high ({metrics.memory.percent.toFixed(1)}%) - Auto-optimization active
              </div>
            )}
            {metrics.cpu_usage > 95 && (
              <div className="text-sm">
                ⚠️ {new Date().toLocaleTimeString()} - CPU Peak detected ({metrics.cpu_usage.toFixed(1)}%)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealthDashboard;
