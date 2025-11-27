'use client';

import { useEffect, useState } from 'react';

interface PipelineTaskMetrics {
  taskId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  agentAssigned?: string;
  duration: number;
  successIndicator: boolean;
}

interface PipelineTelemetry {
  timestamp: string;
  overallStatus: 'ok' | 'degraded' | 'failed';
  tasksInFlight: number;
  tasksCompleted: number;
  tasksFailed: number;
  averageLatency: number;
  recentTasks: PipelineTaskMetrics[];
}

interface PipelineViewProps {
  telemetry?: PipelineTelemetry | null;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const statusToColor = (status: 'ok' | 'degraded' | 'failed'): string => {
  switch (status) {
    case 'ok':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'degraded':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'failed':
      return 'text-red-600 bg-red-50 border-red-200';
  }
};

const statusBadge = (status: 'ok' | 'degraded' | 'failed'): string => {
  switch (status) {
    case 'ok':
      return 'bg-green-100 text-green-800';
    case 'degraded':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
  }
};

const taskStatusColor = (status: 'queued' | 'running' | 'completed' | 'failed'): string => {
  switch (status) {
    case 'queued':
      return 'bg-slate-100 text-slate-800';
    case 'running':
      return 'bg-blue-100 text-blue-800 animate-pulse';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
  }
};

const formatLatency = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export default function PipelineView({
  telemetry: initialTelemetry,
  autoRefresh = true,
  refreshInterval = 5000,
}: PipelineViewProps) {
  const [telemetry, setTelemetry] = useState<PipelineTelemetry | null>(initialTelemetry || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  const fetchPipelineTelemetry = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/monitor/telemetry');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: PipelineTelemetry = await response.json();
      setTelemetry(data);
      setLastUpdate(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pipeline telemetry');
      console.error('[PipelineView] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialTelemetry) {
      fetchPipelineTelemetry();
    }
  }, [initialTelemetry]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchPipelineTelemetry, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  if (!telemetry) {
    return (
      <div className="p-8 text-center text-slate-500">
        No pipeline telemetry available.
      </div>
    );
  }

  const totalTasks = telemetry.tasksCompleted + telemetry.tasksFailed + telemetry.tasksInFlight;
  const successRate = totalTasks > 0 ? ((telemetry.tasksCompleted / totalTasks) * 100).toFixed(1) : '0';

  return (
    <div className="w-full space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Pipeline Telemetry</h2>
        <div className="flex items-center gap-2">
          {loading && <span className="text-xs text-slate-500 animate-pulse">Updating...</span>}
          <button
            onClick={fetchPipelineTelemetry}
            disabled={loading}
            className="px-3 py-1 text-xs bg-slate-200 hover:bg-slate-300 disabled:opacity-50 rounded"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          Error: {error}
        </div>
      )}

      {/* Status Summary Cards */}
      <div className={`p-4 rounded-lg border-2 ${statusToColor(telemetry.overallStatus)}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base">Pipeline Status</h3>
          <span className={`px-3 py-1 text-xs font-medium rounded ${statusBadge(telemetry.overallStatus)}`}>
            {telemetry.overallStatus.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-slate-600 mb-1">In Flight</p>
            <p className="text-2xl font-bold">{telemetry.tasksInFlight}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">{telemetry.tasksCompleted}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-600">{telemetry.tasksFailed}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Success Rate</p>
            <p className="text-2xl font-bold text-green-600">{successRate}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Avg Latency</p>
            <p className="text-2xl font-bold">{formatLatency(telemetry.averageLatency)}</p>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="font-semibold text-base">Recent Tasks</h3>
        </div>
        
        {telemetry.recentTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No recent tasks
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {telemetry.recentTasks.map((task) => (
              <div key={task.taskId} className="p-4 hover:bg-slate-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-mono text-sm font-semibold text-slate-900">
                    {task.taskId}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${taskStatusColor(task.status)}`}>
                    {task.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Agent</p>
                    <p className="font-mono text-slate-900">{task.agentAssigned || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Duration</p>
                    <p className="font-mono text-slate-900">{formatLatency(task.duration)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Result</p>
                    <p className={`font-mono font-semibold ${task.successIndicator ? 'text-green-600' : 'text-red-600'}`}>
                      {task.successIndicator ? 'SUCCESS' : 'FAILED'}
                    </p>
                  </div>
                  <div></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 text-right">
        Last updated: {new Date(lastUpdate).toLocaleTimeString()}
      </div>
    </div>
  );
}
