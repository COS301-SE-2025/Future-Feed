import { create } from "zustand"

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
  followingUsers: User[]                             // 
  setFollowStatus: (userId: number, isFollowing: boolean) => void
  bulkSetFollowStatus: (statuses: Record<number, boolean>) => void
  updateFollowStatus: (userId: number, isFollowing: boolean) => void
  setFollowingUserIds: (ids: number[]) => void
  setFollowingUsers: (users: User[]) => void         // 
  addFollowingUser: (user: User) => void             // 
  removeFollowingUser: (userId: number) => void      // 
  followers: User[]
setFollowers: (users: User[]) => void
fetchFollowing: (userId: number, allUsers: User[]) => Promise<void>
fetchFollowers: (userId: number, allUsers: User[]) => Promise<void>
}

export const useFollowStore = create<FollowStore>((set) => ({
  followStatus: {},
  followingUserIds: [],
  followingUsers: [],
  followers: [],
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
    set(() => ({
      followStatus: statuses,
      followingUserIds: Object.entries(statuses)
        .filter(([, value]) => value)
        .map(([id]) => Number(id)),
    })),

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
}))
