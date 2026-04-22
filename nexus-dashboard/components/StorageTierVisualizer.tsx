import React, { useRef, useEffect } from 'react';
import useSWR from 'swr';
import type { StorageTiersResponse } from '../pages/api/storage/tiers';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface TierCardProps {
  name: string;
  icon: string;
  used: string;
  total: string;
  percent: number;
  free: string;
  status: 'healthy' | 'warning' | 'critical' | 'unmounted';
  description: string;
  mounted?: boolean;
  dockerRaw?: string;
}

const TierCard: React.FC<TierCardProps> = ({
  name,
  icon,
  used,
  total,
  percent,
  free,
  status,
  description,
  mounted = true,
  dockerRaw,
}) => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${percent}%`;
    }
  }, [percent]);
  const statusColors = {
    healthy: 'border-green-500/50',
    warning: 'border-yellow-500/50',
    critical: 'border-red-500/50',
    unmounted: 'border-gray-500/50',
  };

  const getProgressColor = () => {
    if (!mounted) return 'bg-gray-500';
    if (percent > 85) return 'bg-red-500';
    if (percent > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div
      className={`bg-gray-800/50 border-2 ${statusColors[status]} rounded-lg p-6 transition-all hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        </div>
      </div>

      {mounted ? (
        <>
          {/* Usage Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>{used} used</span>
              <span>{percent}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                ref={progressRef}
                className={`h-full ${getProgressColor()} transition-all duration-500`}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{free} free</span>
              <span>{total} total</span>
            </div>
          </div>

          {/* Docker Info (Hot tier only) */}
          {dockerRaw && (
            <div className="text-xs text-gray-400 mt-2">
              Docker.raw: {dockerRaw}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4 text-gray-400">
          <p>❌ Drive not mounted</p>
        </div>
      )}
    </div>
  );
};

export const StorageTierVisualizer: React.FC = () => {
  const { data, error } = useSWR<StorageTiersResponse>(
    '/api/storage/tiers',
    fetcher,
    { refreshInterval: 60000 } // Refresh every 60 seconds
  );

  if (error) {
    return (
      <div className="p-6 bg-red-500/20 border-2 border-red-500/50 rounded-lg">
        <p className="text-red-400">Failed to load storage data</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-gray-500/20 border-2 border-gray-500/50 rounded-lg">
        <p className="text-gray-400">Loading storage tiers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AILCC Storage Overview</h2>
        <div className="text-sm text-gray-400">
          Last updated: {new Date(data.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Tier Flow Diagram */}
      <div className="flex items-center gap-4 justify-center py-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-sm font-semibold">HOT</div>
          <div className="text-xs text-gray-400">Active</div>
        </div>
        <div className="text-2xl text-slate-400">→</div>
        <div className="text-center">
          <div className="text-4xl mb-2">💾</div>
          <div className="text-sm font-semibold">WARM</div>
          <div className="text-xs text-gray-400">Archives</div>
        </div>
        <div className="text-2xl text-slate-400">→</div>
        <div className="text-center">
          <div className="text-4xl mb-2">🧊</div>
          <div className="text-sm font-semibold">COLD</div>
          <div className="text-xs text-gray-400">Backups</div>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TierCard
          name="Hot Storage"
          icon="🔥"
          used={data.hot.used}
          total={data.hot.total}
          percent={data.hot.percent}
          free={data.hot.free}
          status={data.hot.status}
          description={data.hot.description}
          dockerRaw={data.hot.dockerRaw}
        />

        <TierCard
          name="Warm Storage"
          icon="💾"
          used={data.warm.used}
          total={data.warm.total}
          percent={data.warm.percent}
          free={data.warm.free}
          status={data.warm.status}
          description={data.warm.description}
          mounted={data.warm.mounted}
        />

        <TierCard
          name="Cold Storage"
          icon="🧊"
          used={data.cold.used}
          total={data.cold.total}
          percent={data.cold.percent}
          free={data.cold.free}
          status={data.cold.status}
          description={data.cold.description}
          mounted={data.cold.mounted}
        />
      </div>

      {/* Cloud Sync Status */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">☁️ Cloud Sync Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">⏸️</span>
            <span className="text-sm">Google Drive (Paused)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">✗</span>
            <span className="text-sm text-gray-400">OneDrive (Inactive)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span className="text-sm">iCloud (Active)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageTierVisualizer;
