import React from 'react';
import useSWR from 'swr';
import type { ActivityResponse } from '../pages/api/storage/activity';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ActivityItemProps {
  timestamp: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  action: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  timestamp,
  type,
  severity,
  action,
}) => {
  const severityIcons = {
    info: '🔄',
    warning: '⚠️',
    critical: '🚨',
  };

  const severityColors = {
    info: 'text-blue-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400',
  };

  const typeLabels = {
    memory_orchestrator: 'Memory Orchestrator',
    storage_orchestrator: 'Storage Orchestrator',
    process_monitor: 'Process Monitor',
  };

  return (
    <div className="border-l-2 border-gray-700 pl-4 py-3 hover:border-blue-500 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{severityIcons[severity]}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold">
              {typeLabels[type as keyof typeof typeLabels] || type}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className={`text-sm ${severityColors[severity]}`}>{action}</p>
        </div>
      </div>
    </div>
  );
};

export const DataFlowVisualizer: React.FC = () => {
  const { data, error } = useSWR<ActivityResponse>(
    '/api/storage/activity',
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  if (error) {
    return (
      <div className="p-6 bg-red-500/20 border-2 border-red-500/50 rounded-lg">
        <p className="text-red-400">Failed to load activity data</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-gray-500/20 border-2 border-gray-500/50 rounded-lg">
        <p className="text-gray-400">Loading activity...</p>
      </div>
    );
  }

  const hasActivities = data.activities && data.activities.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Data Flow & Automation Status</h2>
        <div className="text-sm text-gray-400">
          Last updated: {new Date(data.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        
        {hasActivities ? (
          <div className="space-y-2">
            {data.activities.map((activity, index) => (
              <ActivityItem
                key={`${activity.timestamp}-${index}`}
                timestamp={activity.timestamp}
                type={activity.type}
                severity={activity.severity}
                action={activity.action}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No recent activity logged</p>
            <p className="text-sm mt-2">
              Automation will log events as they occur
            </p>
          </div>
        )}
      </div>

      {/* Next Scheduled */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Next Scheduled</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
            <div className="text-2xl mb-2">💾</div>
            <div className="text-sm font-semibold">Memory Check</div>
            <div className="text-xs text-gray-400 mt-1">Every 30 minutes</div>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-lg">
            <div className="text-2xl mb-2">⚙️</div>
            <div className="text-sm font-semibold">Process Health</div>
            <div className="text-xs text-gray-400 mt-1">Every hour</div>
          </div>
          <div className="text-center p-4 bg-green-500/10 rounded-lg">
            <div className="text-2xl mb-2">💿</div>
            <div className="text-sm font-semibold">Storage Check</div>
            <div className="text-xs text-gray-400 mt-1">Every 2 hours</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataFlowVisualizer;
