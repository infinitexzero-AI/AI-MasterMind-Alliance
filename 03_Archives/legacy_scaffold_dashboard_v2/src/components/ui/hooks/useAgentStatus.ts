import { useState, useEffect } from 'react';

export interface AgentView {
  name: string;
  role: string;
  status: 'ok' | 'warn' | 'error' | 'paused' | 'offline' | 'active' | 'idle';
  availability: 'available' | 'busy' | 'unavailable';
  currentTask?: string;
  uptime: number;
  successCount: number;
  errorCount: number;
  lastHeartbeat: string;
  latency: number;
}

export function useAgentStatus() {
  const [agents, setAgents] = useState<AgentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchTelemetry() {
    try {
      // Parallel fetch for health and status
      const [healthRes, statusRes] = await Promise.all([
        fetch('/api/forge/agents/health'),
        fetch('/api/forge/agents/status')
      ]);

      if (!healthRes.ok || !statusRes.ok) {
        throw new Error('Failed to fetch agent telemetry');
      }

      const healthData = await healthRes.json();
      const statusData = await statusRes.json();

      // Merge data sources
      // We assume both arrays are indexed by agentName or can be matched
      const merged: AgentView[] = healthData.agents.map((h: any) => {
        const s = statusData.agents.find((sa: any) => sa.agentName === h.agentName);
        return {
          name: h.agentName,
          role: getRole(h.agentName), // Helper to derive role
          status: h.status,
          availability: s?.availability || 'unavailable',
          currentTask: s?.currentTask,
          uptime: h.uptime,
          successCount: h.successCount,
          errorCount: h.errorCount,
          lastHeartbeat: h.lastHeartbeat,
          latency: s?.latency || 0,
        };
      });

      setAgents(merged);
      setError(null);
    } catch (err: any) {
      console.error('Telemetry Error:', err);
      // Don't wipe data on transient error, just set error state
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000); // 2s polling for real-time feel
    return () => clearInterval(interval);
  }, []);

  return { agents, loading, error };
}

function getRole(name: string): string {
  switch (name.toLowerCase()) {
    case 'claude': return 'Research & Analysis';
    case 'openai': return 'Code Generation';
    case 'grok': return 'Reasoning & Logic';
    default: return 'General Purpose';
  }
}
