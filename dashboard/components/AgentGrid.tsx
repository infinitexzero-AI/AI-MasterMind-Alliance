'use client';

import { useEffect, useState } from 'react';

interface AgentHealth {
  agentName: string;
  status: 'ok' | 'warn' | 'error';
  uptime: number;
  lastHeartbeat: string;
  errorCount: number;
  successCount: number;
}

interface HealthResponse {
  timestamp: string;
  agents: AgentHealth[];
}

interface AgentGridProps {
  agents?: AgentHealth[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const statusToColor = (status: 'ok' | 'warn' | 'error'): string => {
  switch (status) {
    case 'ok':
      return 'text-green-600 bg-green-50';
    case 'warn':
      return 'text-yellow-600 bg-yellow-50';
    case 'error':
      return 'text-red-600 bg-red-50';
  }
};

const statusToBadge = (status: 'ok' | 'warn' | 'error'): string => {
  switch (status) {
    case 'ok':
      return 'bg-green-100 text-green-800';
    case 'warn':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
      return 'bg-red-100 text-red-800';
  }
};

const formatUptime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
};

const calculateHealthScore = (agent: AgentHealth): number => {
  const total = agent.successCount + agent.errorCount;
  if (total === 0) return 100;
  return Math.round((agent.successCount / total) * 100);
};

export default function AgentGrid({
  agents: initialAgents,
  autoRefresh = true,
  refreshInterval = 5000,
}: AgentGridProps) {
  const [agents, setAgents] = useState<AgentHealth[]>(initialAgents || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  const fetchAgentHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/monitor/health');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: HealthResponse = await response.json();
      setAgents(data.agents);
      setLastUpdate(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent health');
      console.error('[AgentGrid] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialAgents) {
      fetchAgentHealth();
    }
  }, [initialAgents]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchAgentHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Agent Health</h2>
        <div className="flex items-center gap-2">
          {loading && <span className="text-xs text-slate-500 animate-pulse">Updating...</span>}
          <button
            onClick={fetchAgentHealth}
            disabled={loading}
            className="px-3 py-1 text-xs bg-slate-200 hover:bg-slate-300 disabled:opacity-50 rounded"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          Error: {error}
        </div>
      )}

      {agents.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          No agent data available. {autoRefresh && 'Waiting for updates...'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const healthScore = calculateHealthScore(agent);
            const uptimeStr = formatUptime(agent.uptime);
            return (
              <div
                key={agent.agentName}
                className={`p-4 rounded-lg border-2 transition-all ${statusToColor(agent.status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg capitalize">{agent.agentName}</h3>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${statusToBadge(agent.status)}`}>
                      {agent.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{healthScore}%</div>
                    <p className="text-xs text-slate-600">Health Score</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Uptime:</span>
                    <span className="font-mono font-semibold">{uptimeStr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Successes:</span>
                    <span className="font-mono text-green-600 font-semibold">{agent.successCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Errors:</span>
                    <span className="font-mono text-red-600 font-semibold">{agent.errorCount}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-xs text-slate-600">Last Heartbeat:</span>
                    <span className="text-xs font-mono">
                      {new Date(agent.lastHeartbeat).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 text-xs text-slate-500 text-right">
        Last updated: {new Date(lastUpdate).toLocaleTimeString()}
      </div>
    </div>
  );
}
