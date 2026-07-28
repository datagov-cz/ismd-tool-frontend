import { useSyncExternalStore } from 'react';
import { onlineManager } from '@tanstack/react-query';

// Backed by TanStack's onlineManager so UI indicators and paused-mutation
// resume share one online/offline source of truth.
export const useIsOnline = () => {
  return useSyncExternalStore(
    (onStoreChange) => onlineManager.subscribe(onStoreChange),
    () => onlineManager.isOnline(),
    () => true,
  );
};
