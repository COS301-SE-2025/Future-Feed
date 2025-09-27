// hooks/useTrendingTopics.ts
import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export interface TrendingTopic {
  id: number;
  name: string;
}

const fetchTrendingTopics = async (): Promise<TrendingTopic[]> => {
  const res = await fetch(`${API_URL}/api/topics/trending`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch trending topics: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  console.log('Trending topics fetched:', data); // Debug log
  return data;
};

export const useTrendingTopics = () => {
  return useQuery<TrendingTopic[], Error>({
    queryKey: ['trendingTopics'],
    queryFn: fetchTrendingTopics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};