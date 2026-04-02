import { useQuery } from '@tanstack/react-query';

export interface GraphNode { id: string; group?: number; [key: string]: any; }
export interface GraphLink { source: string; target: string; relationship?: string; [key: string]: any; }

export interface ScholarGraphResponse { 
    nodes: GraphNode[]; 
    links: GraphLink[]; 
}

export interface ApiError { 
    success: boolean; 
    message: string; 
    code: number; 
    details: string; 
}

export function useScholarGraph() {
  return useQuery<ScholarGraphResponse, ApiError>({
    queryKey: ['observer', 'scholar-graph'],
    queryFn: async () => {
      const res = await fetch('/api/scholar_graph');
      const data = await res.json();
      
      if (!res.ok) {
        console.error("OBSERVER_TELEMETRY [UI Event]: /api/scholar_graph Query Degraded.", data);
        throw data as ApiError;
      }
      return data as ScholarGraphResponse;
    },
    staleTime: 60000, // Academic knowledge graphs rarely update by the millisecond. 1-minute stale limit.
  });
}
