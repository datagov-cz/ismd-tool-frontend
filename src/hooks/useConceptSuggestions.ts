import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useIsOnline } from '@/hooks/useIsOnline';
import { pollInterval } from '@/lib/aiPolling';
import {
  fetchConceptSuggestionJob,
  startConceptSuggestionJob,
} from '@/lib/conceptSuggestion/api';
import type {
  ConceptSuggestion,
  ConceptSuggestionJob,
  ConceptSuggestionRequest,
} from '@/lib/conceptSuggestion/types';

const START_DELAY_MS = 600;
const MAX_POLL_ERRORS = 10;

type Failure = 'Rejected' | 'StartError' | 'NotFound' | 'Failed' | 'PollError';

type Job = {
  jobId: string;
  startedAt: number;
};

type Outcome =
  | { status: 'done'; jobId: string; suggestions: ConceptSuggestion[] }
  | { status: 'failed'; failure: Failure };

export type ConceptSuggestionState =
  | { status: 'offline' }
  | { status: 'loading'; isReconnecting: boolean }
  | { status: 'failed' }
  | { status: 'done'; jobId: string; suggestions: ConceptSuggestion[] };

const startFailure = (
  kind: ConceptSuggestionRequest['kind'],
  error: unknown,
): Failure =>
  kind !== 'TRIDA' &&
  axios.isAxiosError(error) &&
  error.response?.status === 422
    ? 'Rejected'
    : 'StartError';

const pollFailure = (error: unknown, errorCount: number): Failure | null => {
  if (!error) {
    return null;
  }
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  if (status === 404) {
    return 'NotFound';
  }
  if (status !== undefined && status < 500) {
    return 'PollError';
  }
  return errorCount >= MAX_POLL_ERRORS ? 'PollError' : null;
};

const outcomeOf = (
  data: ConceptSuggestionJob | null | undefined,
  error: unknown,
  errorCount: number,
): Outcome | null => {
  if (data?.status === 'completed') {
    return { status: 'done', jobId: data.jobId, suggestions: data.suggestions };
  }
  if (data?.status === 'failed') {
    return { status: 'failed', failure: 'Failed' };
  }
  if (data === null) {
    return { status: 'failed', failure: 'NotFound' };
  }
  const failure = pollFailure(error, errorCount);
  return failure ? { status: 'failed', failure } : null;
};

export const useConceptSuggestions = (
  request: ConceptSuggestionRequest,
): ConceptSuggestionState => {
  const t = useTranslations('CreateConcept.LegalSourceAutofill.Ai');
  const isOnline = useIsOnline();
  const started = useRef(false);
  const [job, setJob] = useState<Job | null>(null);
  const [startError, setStartError] = useState<Failure | null>(null);

  useEffect(() => {
    if (!isOnline || started.current) {
      return;
    }
    const timer = setTimeout(() => {
      started.current = true;
      startConceptSuggestionJob(request)
        .then(({ jobId }) => setJob({ jobId, startedAt: Date.now() }))
        .catch((error: unknown) =>
          setStartError(startFailure(request.kind, error)),
        );
    }, START_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isOnline, request]);

  const { data, error, errorUpdateCount } = useQuery({
    queryKey: ['conceptSuggestionJob', request.kind, job?.jobId],
    queryFn: () =>
      job ? fetchConceptSuggestionJob(request.kind, job.jobId) : null,
    enabled: !!job,
    refetchInterval: ({ state }) =>
      job && !outcomeOf(state.data, state.error, state.errorUpdateCount)
        ? pollInterval(job.startedAt)
        : false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    retry: false,
    gcTime: 0,
  });

  const outcome = job ? outcomeOf(data, error, errorUpdateCount) : null;
  const failure =
    startError ?? (outcome?.status === 'failed' ? outcome.failure : null);

  useEffect(() => {
    if (failure) {
      toast.error(t(failure));
    }
  }, [failure, t]);

  if (failure) {
    return { status: 'failed' };
  }
  if (outcome?.status === 'done') {
    return outcome;
  }
  if (!isOnline && !job) {
    return { status: 'offline' };
  }
  return { status: 'loading', isReconnecting: !!error };
};
