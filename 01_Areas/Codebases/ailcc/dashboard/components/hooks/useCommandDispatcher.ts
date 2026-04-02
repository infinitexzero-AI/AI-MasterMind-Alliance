import { useState } from 'react';
import { useSwarmTelemetry } from '../../hooks/useSwarmTelemetry';

interface DispatchResult {
  role?: string;
  task_id?: string;
  status?: string;
  message?: string;
  [key: string]: string | undefined;
}

export function useCommandDispatcher() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DispatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { dispatchTask } = useSwarmTelemetry();

  const dispatchCommand = async (query: string, airGap: boolean = false) => {
    if (!query.trim()) return null;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Phase 83: Zero-Trust WebSocket bypass replacing legacy /api/dispatch
      const payloadObj = {
          description: query,
          airGap: airGap
      };
      
      const success = dispatchTask(payloadObj);

      if (!success) {
        throw new Error(`Dispatch failed: WebSocket pipeline is inactive.`);
      }

      const dummyResponse = { role: 'VANGUARD_ROUTER', status: 'TRANSMITTED', message: 'Task injected cleanly into Node-Python Bridge.' };
      setResult(dummyResponse);
      return dummyResponse;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to dispatch command via WebSocket';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { dispatchCommand, loading, result, error };
}
