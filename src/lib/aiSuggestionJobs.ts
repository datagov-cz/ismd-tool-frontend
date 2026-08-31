import { type Jwt } from '@/api/generated';

export const PROXY_HANDLED_JWT = { jwt: undefined as unknown as Jwt };

export const DEFAULT_LANGUAGE = 'cs';

const POLL_INTERVAL = 2000;

type AiJob = { status: string };

export const hasPendingJob = (jobs?: AiJob[]) =>
  jobs?.some((job) => job.status === 'in_progress') ?? false;

export const hasFailedJob = (jobs?: AiJob[]) =>
  jobs?.some((job) => job.status === 'failed') ?? false;

export const pollWhileRunning = {
  refetchInterval: (query: { state: { data?: AiJob[] } }) =>
    hasPendingJob(query.state.data) ? POLL_INTERVAL : false,
};

export const localizedText = (value?: Record<string, string>) =>
  value?.[DEFAULT_LANGUAGE] ?? Object.values(value ?? {})[0] ?? '';
