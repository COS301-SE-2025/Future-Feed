// hooks/useStoreHydration.ts
import { useEffect, useState } from 'react';
import { useFollowStore } from '@/store/useFollowStore';

export const useStoreHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const hasHydrated = useFollowStore(state => state._hasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      setIsHydrated(true);
      //console.log(' Store hydration completed');
    }
  }, [hasHydrated]);

  return isHydrated;
};