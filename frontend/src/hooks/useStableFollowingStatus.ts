import { useEffect, useState, useMemo, useRef } from 'react';
import { shallow } from 'zustand/shallow';
import { useFollowStore } from '../store/useFollowStore';

export const useStableFollowStatus = (userIds: number[]) => {
  const [stableStatuses, setStableStatuses] = useState<Record<number, boolean>>({});
  const prevUserIdsRef = useRef<number[]>([]);
  const prevStatusesRef = useRef<Record<number, boolean>>({});

  // Memoize the selector to prevent unnecessary recalculations
  const selector = useMemo(() => {
    return (state: { followStatus: Record<number, boolean> }) => {
      const statuses: Record<number, boolean> = {};
      userIds.forEach(id => {
        statuses[id] = state.followStatus[id] ?? false;
      });
      return statuses;
    };
  }, [userIds]);

  // Get current statuses with the memoized selector and shallow comparison
  const currentStatuses = useFollowStore(selector, shallow);

  // Update stable statuses only when actual values change
  useEffect(() => {
  

    // Check if userIds array has changed
    const userIdsChanged = 
      userIds.length !== prevUserIdsRef.current.length ||
      !userIds.every((id, i) => id === prevUserIdsRef.current[i]);

    // Check if any status has actually changed
    const statusesChanged = userIds.some(id => 
      prevStatusesRef.current[id] !== currentStatuses[id]
    );
  

    if (userIdsChanged || statusesChanged) {
      setStableStatuses(currentStatuses);
      prevUserIdsRef.current = userIds;
      prevStatusesRef.current = currentStatuses;
    }
  }, [currentStatuses, userIds]);

  return stableStatuses;
};