import { useState } from 'react';

interface DispatchResult {
  role?: string;
  task_id?: string;
  status?: string;
  message?: string;
  [key: string]: any;
}

export function useCommandDispatcher() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DispatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dispatchCommand = async (query: string) => {
    if (!query.trim()) return null;
    
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: query }),
      });
      
      if (!res.ok) {
        throw new Error(`Dispatch failed: ${res.statusText}`);
      }

      const data = await res.json();
      setResult(data);
      return data;
    } catch (err: any) {
      console.error('Dispatch Error:', err);
      setError(err.message || 'Failed to dispatch command');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { dispatchCommand, loading, result, error };
}
