import { useQuery } from '@tanstack/react-query';

export interface ReviewSnippet { 
    filename: string; 
    title: string; 
    date: string; 
    snippet: string; 
}

export interface ReviewsResponse { 
    success: boolean; 
    reviews: ReviewSnippet[]; 
}

export interface ApiError { 
    success: boolean; 
    message: string; 
    code: number; 
    details: string; 
}

export function useLiteratureReviews() {
  return useQuery<ReviewsResponse, ApiError>({
    queryKey: ['observer', 'literature-reviews'],
    queryFn: async () => {
      const res = await fetch('/api/literature_reviews');
      const data = await res.json();
      
      if (!res.ok || (data.success === false)) {
        console.error("OBSERVER_TELEMETRY [UI Event]: /api/literature_reviews Query Degraded.", data);
        throw data as ApiError;
      }
      return data as ReviewsResponse;
    },
    staleTime: 60000, 
  });
}
