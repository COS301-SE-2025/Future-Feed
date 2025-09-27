import { createWithEqualityFn } from 'zustand/traditional';
import { persist } from 'zustand/middleware'; // Add persistence to fix issue on returning to page
import type  { StateStorage } from 'zustand/middleware';

type FollowStatus = Record<number, boolean>

const API_URL = import.meta.env.VITE_API_Url || "http://localhost:8080"

interface User {
  id: number
  username: string
  displayName: string
  email: string
  profilePicture?: string | null;
  bio?: string | null;
  name: string;
  dateOfBirth?: string | null
}

interface FollowRelation {
  id: number;
  followerId: number;
  followedId: number;
  followedAt: string;
}

interface FollowStore {
  followStatus: FollowStatus
  followingUserIds: number[]
  followingUsers: User[]
  //hydration below
  _hasHydrated: boolean
  setHasHydrated: (hydrated: boolean) => void 
  setFollowStatus: (userId: number, isFollowing: boolean) => void
  bulkSetFollowStatus: (statuses: Record<number, boolean>) => void
  updateFollowStatus: (userId: number, isFollowing: boolean) => void
  setFollowingUserIds: (ids: number[]) => void
  setFollowingUsers: (users: User[]) => void
  addFollowingUser: (user: User) => void
  removeFollowingUser: (userId: number) => void
  followers: User[]
  setFollowers: (users: User[]) => void
  fetchFollowing: (userId: number, allUsers: User[]) => Promise<void>
  fetchFollowers: (userId: number, allUsers: User[]) => Promise<void>
  safeUpdateStatus: (userId: number, isFollowing: boolean) => void
}

export const useFollowStore = createWithEqualityFn<FollowStore>()(
  persist( // Wrap everything with persist()
    (set,get) => ({ // entire store is now persisted acrooss pages
      followStatus: {},
      followingUserIds: [],
      followingUsers: [],
      followers: [],
      _hasHydrated: false, // Initial hydration state
      
      // Add hydration setter
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
      // Add a method to clean the followStatus
      cleanFollowStatus: () => {
        const state = get();
        const cleanFollowStatus = Object.fromEntries(
          Object.entries(state.followStatus).filter(([_, value]) => value !== undefined)
        );
        set({ followStatus: cleanFollowStatus });
      },
      
      setFollowers: (users) => set(() => ({ followers: users })),

      fetchFollowing: async (userId, allUsers) => {
        try {
          const res = await fetch(`${API_URL}/api/follow/following/${userId}`, {
            method: "GET",
            credentials: "include",
          });

          const data: FollowRelation[] = await res.json();
          const followedUserIds = data.map((relation) => relation.followedId);
          console.log("Followed User IDs following:", followedUserIds);
          const normalized = allUsers.map(u => ({
            ...u,
            bio: u.bio ?? null,
            profilePicture: u.profilePicture ?? null,
          }));

          const followedUsers = normalized.filter((u) =>
            followedUserIds.includes(u.id)
          );
          set(() => ({ followingUsers: followedUsers }));
        } catch (err) {
          console.error("Failed to fetch following users", err);
        }
      },

      fetchFollowers: async (userId, allUsers) => {
        try {
          const res = await fetch(`${API_URL}/api/follow/followers/${userId}`, {
            method: "GET",
            credentials: "include",
          });

          const data: FollowRelation[] = await res.json();
          const followerUserIds = data.map((relation) => relation.followerId);
          console.log("Follower User IDs followers:", followerUserIds);
          const normalized = allUsers.map(u => ({
            ...u,
            bio: u.bio ?? null,
            profilePicture: u.profilePicture ?? null,
          }));

          const followerUsers = normalized.filter((u) =>
            followerUserIds.includes(u.id)
          );
          set(() => ({ followers: followerUsers }));
        } catch (err) {
          console.error("Failed to fetch followers", err);
        }
      },

      setFollowStatus: (userId, isFollowing) =>
        set((state) => ({
          followStatus: {
            ...state.followStatus,
            [userId]: isFollowing,
          },
          followingUserIds: isFollowing
            ? [...new Set([...state.followingUserIds, userId])]
            : state.followingUserIds.filter((id) => id !== userId),
        })),

      updateFollowStatus: (userId, isFollowing) =>
        set((state) => ({
          followStatus: {
            ...state.followStatus,
            [userId]: isFollowing,
          },
          followingUserIds: isFollowing
            ? [...new Set([...state.followingUserIds, userId])]
            : state.followingUserIds.filter((id) => id !== userId),
        })),

     bulkSetFollowStatus: (statuses) =>
  set((state) => {
    // Filter out undefined values
    const cleanStatuses = Object.fromEntries(
      Object.entries(statuses).filter(([_, value]) => value !== undefined)
    );
    
    return {
      followStatus: {
        ...state.followStatus,
        ...cleanStatuses
      },
      followingUserIds: [
        ...new Set([
          ...state.followingUserIds,
          ...Object.entries(cleanStatuses)
            .filter(([, value]) => value === true) // Only add true values
            .map(([id]) => Number(id))
        ])
      ]
    };
  }),
      safeUpdateStatus: (userId: number, isFollowing: boolean) =>
        set((state): Partial<FollowStore> => {
          const newStatus = {
            ...state.followStatus,
            [userId]: isFollowing,
          };
          
          const newFollowingIds = isFollowing
            ? [...new Set([...state.followingUserIds, userId])]
            : state.followingUserIds.filter((id) => id !== userId);

          return {
            followStatus: newStatus,
            followingUserIds: newFollowingIds,
          };
        }),

      setFollowingUserIds: (ids) => set(() => ({ followingUserIds: ids })),

      setFollowingUsers: (users) => set(() => ({ followingUsers: users })),

      addFollowingUser: (user) =>
        set((state) => {
          const alreadyExists = state.followingUsers.some((u) => u.id === user.id)
          return {
            followingUsers: alreadyExists ? state.followingUsers : [...state.followingUsers, user],
          }
        }),

      removeFollowingUser: (userId) =>
        set((state) => ({
          followingUsers: state.followingUsers.filter((u) => u.id !== userId),
        })),
    }),
 {
    name: 'follow-store',
    partialize: (state) => ({
      followStatus: state.followStatus,
      followingUserIds: state.followingUserIds
    }),
    // Add migration to handle existing data
    version: 1,
    migrate: (persistedState, version) => {
      if (version === 0) {
        // Clean up any undefined values from previous versions
        const state = persistedState as any;
        if (state.followStatus) {
          state.followStatus = Object.fromEntries(
            Object.entries(state.followStatus).filter(([_, value]) => value !== undefined)
          );
        }
        if (!state.followingUserIds) {
          state.followingUserIds = [];
        }
        return state;
      }
      return persistedState;
    },
     onRehydrateStorage: () => async (state) => {
     if (state) {
    console.log(' Store hydrated with:', {
      followStatus: state.followStatus,
      followingUserIds: state.followingUserIds
    });
    // Just mark as hydrated - don't try to modify state here
    state.setHasHydrated(true);
  }
      },
    }
  )
);