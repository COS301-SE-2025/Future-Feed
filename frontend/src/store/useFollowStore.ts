import { create } from "zustand"

type FollowStatus = Record<number, boolean>

interface FollowStore {
  followStatus: FollowStatus
  followingUserIds: number[] // ✅ new
  setFollowStatus: (userId: number, isFollowing: boolean) => void
  bulkSetFollowStatus: (statuses: Record<number, boolean>) => void
  updateFollowStatus: (userId: number, isFollowing: boolean) => void
  setFollowingUserIds: (ids: number[]) => void // ✅ new
}

export const useFollowStore = create<FollowStore>((set) => ({
  followStatus: {},
  followingUserIds: [],

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
}))
