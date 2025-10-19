import { useEffect } from 'react';
import { useFollowStore } from '@/store/useFollowStore';

export const StoreDebug = () => {
  const { followStatus, followingUserIds, _hasHydrated } = useFollowStore();

  useEffect(() => {
    console.log('🔍 STORE DEBUG:', {
      hasHydrated: _hasHydrated,
      followStatusCount: Object.keys(followStatus).length,
      followingUserIdsCount: followingUserIds.length,
      followStatus: followStatus
    });
  }, [followStatus, followingUserIds, _hasHydrated]);

  return null;
};