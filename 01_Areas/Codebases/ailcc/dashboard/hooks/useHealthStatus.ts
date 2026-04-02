import { useQuery } from '@tanstack/react-query';

export interface HealthResponse {
  success: boolean;
  status: 'OPTIMAL' | 'DEGRADED' | 'OFFLINE';
  timestamp: string;
  service: string;
  system: {
    memory: { usage: number };
    cpu: { usage: number };
    disk: { usage: number };
  };
  message: string;
}

export interface ApiError {
  success: boolean;
  message: string;
  code: number;
  details: string;
}

export function useHealthStatus() {
  return useQuery<HealthResponse, ApiError>({
    queryKey: ['observer', 'health'],
    queryFn: async () => {
      const res = await fetch('/api/health');
      const data = await res.json();
      
      if (!res.ok) {
        // Log React Query error states to the OBSERVER_TELEMETRY channel
        console.error("OBSERVER_TELEMETRY [UI Event]: /api/health Query Degraded.", data);
        throw data as ApiError;
      }
      return data as HealthResponse;
    },
    refetchInterval: 30000, // Background sync every 30s
    staleTime: 10000, // Prevents aggressive re-fetching on momentary tab switches
  });
}
