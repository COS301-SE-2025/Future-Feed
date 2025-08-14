// hooks/useUsersQuery.ts
import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
//same from explore
interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  profilePicture: string;
  bio: string;
}
//
interface FollowRelation {
  id: number;
  followerId: number;
  followedId: number;
  followedAt: string;
}

export const useUsersQuery = () => {
  return useQuery<User[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/user/all`, {
        method: "GET",
        credentials: "include",
      });
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useFollowingQuery = (userId: number | null) => {
  return useQuery<FollowRelation[]>({
    queryKey: ['following', userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`${API_URL}/api/follow/following/${userId}`, {
        method: "GET",
        credentials: "include",
      });
      return res.json();
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};