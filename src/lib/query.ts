import { QueryObserverBaseResult } from '@tanstack/react-query';

type PendingState = Pick<QueryObserverBaseResult, 'isPending' | 'fetchStatus'>;

export const isQueryLoading = ({ isPending, fetchStatus }: PendingState) =>
  isPending && fetchStatus !== 'paused';
