import { useState, useEffect } from 'react';

export interface TaskMetric {
  taskId: string;
  taskType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  agentAssigned: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  successIndicator: boolean;
}

export interface PipelineView {
  timestamp: string;
  tasks: TaskMetric[];
  stats: {
    active: number;
    completed: number;
    failed: number;
    latency: number;
  }
}

export function useTaskQueue() {
  const [pipeline, setPipeline] = useState<PipelineView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPipeline() {
    try {
      const res = await fetch('/api/forge/pipeline/telemetry');
      if (!res.ok) throw new Error('Failed to fetch pipeline telemetry');
      
      const data = await res.json();
      
      setPipeline({
        timestamp: data.timestamp,
        tasks: data.recentTasks || [],
        stats: {
          active: data.tasksInFlight,
          completed: data.tasksCompleted,
          failed: data.tasksFailed,
          latency: data.averageLatency
        }
      });
      setError(null);
    } catch (err: any) {
      // Quietly fail for disconnected backend
      console.warn('Pipeline fetch error', err);
      // Don't set global error to keep UI clean, or maybe just set it if data is null
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPipeline();
    const interval = setInterval(fetchPipeline, 2000);
    return () => clearInterval(interval);
  }, []);

  return { pipeline, loading, error };
}
