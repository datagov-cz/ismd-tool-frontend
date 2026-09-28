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
  ConceptSuggestionKind,
} from '@/lib/conceptSuggestion/types';
import { parseLegalActIri } from '@/lib/vocabularyDraft/legalAct';

type Input = {
  kind: ConceptSuggestionKind;
  fragmentIri: string | null;
  domainIri?: string;
  knownSlugs: string[];
  ready?: boolean;
};

type Job = {
  kind: ConceptSuggestionKind;
  jobId: string;
  startedAt: number;
};

type Result = {
  jobId: string;
  suggestions: ConceptSuggestion[];
};

type PendingStatus =
  | 'idle'
  | 'unsupported'
  | 'offline'
  | 'needsDomain'
  | 'loading'
  | 'failed';

export type ConceptSuggestionState =
  | { [Status in PendingStatus]: { status: Status } }[PendingStatus]
  | { status: 'done'; result: Result };

export type ConceptSuggestionStatus = ConceptSuggestionState['status'];

export const useConceptSuggestions = ({
  kind,
  fragmentIri,
  domainIri,
  knownSlugs,
  ready = true,
}: Input) => {
  const t = useTranslations('CreateConcept.LegalSourceAutofill.Ai');
  const tRef = useRef(t);
  const isOnline = useIsOnline();
  const requestCounter = useRef(0);
  const startedRequest = useRef<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [job, setJob] = useState<Job | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [failed, setFailed] = useState(false);

  const legalAct = fragmentIri ? parseLegalActIri(fragmentIri) : null;
  const needsDomain = kind !== 'TRIDA' && !domainIri;
  const knownSlugsKey = knownSlugs.join('|');
  const canStart = !!legalAct && !needsDomain && isOnline && ready;

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    setJob(null);
    setResult(null);
    setFailed(false);
    return () => {
      requestCounter.current += 1;
    };
  }, [kind, fragmentIri, domainIri, knownSlugsKey, attempt]);

  useEffect(() => {
    if (job || result || failed || !canStart || !fragmentIri) {
      return;
    }
    const requestId = requestCounter.current;
    if (startedRequest.current === requestId) {
      return;
    }
    const act = parseLegalActIri(fragmentIri);
    if (!act) {
      return;
    }
    startedRequest.current = requestId;

    startConceptSuggestionJob(kind, act, knownSlugs, domainIri)
      .then(({ jobId }) => {
        if (requestCounter.current === requestId) {
          setJob({ kind, jobId, startedAt: Date.now() });
        }
      })
      .catch((error: unknown) => {
        if (requestCounter.current === requestId) {
          setFailed(true);
          const domainRejected =
            kind !== 'TRIDA' &&
            axios.isAxiosError(error) &&
            error.response?.status === 422;
          toast.error(
            tRef.current(domainRejected ? 'DomainNotInModel' : 'StartError'),
          );
        }
      });
  }, [
    job,
    result,
    failed,
    canStart,
    kind,
    fragmentIri,
    domainIri,
    knownSlugsKey,
  ]);

  const polling = !!job && !result && !failed;

  const { data, error, isError } = useQuery({
    queryKey: ['conceptSuggestionJob', job?.kind, job?.jobId],
    queryFn: () =>
      job ? fetchConceptSuggestionJob(job.kind, job.jobId) : null,
    enabled: polling,
    refetchInterval: job ? () => pollInterval(job.startedAt) : false,
    refetchIntervalInBackground: true,
    retry: false,
    gcTime: 0,
  });

  useEffect(() => {
    if (!job || result || failed) {
      return;
    }
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      setFailed(true);
      toast.error(tRef.current('NotFound'));
      return;
    }
    if (data === null) {
      setFailed(true);
      toast.error(tRef.current('NotFound'));
      return;
    }
    if (data?.status === 'completed') {
      setResult({ jobId: job.jobId, suggestions: data.suggestions });
      return;
    }
    if (data?.status === 'failed') {
      setFailed(true);
      toast.error(tRef.current('Failed'));
    }
  }, [job, result, failed, data, error]);

  const state: ConceptSuggestionState = (() => {
    if (!fragmentIri) {
      return { status: 'idle' };
    }
    if (!legalAct) {
      return { status: 'unsupported' };
    }
    if (needsDomain) {
      return { status: 'needsDomain' };
    }
    if (!isOnline && !job && !result) {
      return { status: 'offline' };
    }
    if (failed) {
      return { status: 'failed' };
    }
    if (result) {
      return { status: 'done', result };
    }
    return { status: 'loading' };
  })();

  return {
    state,
    isReconnecting: polling && isError,
    retry: () => setAttempt((current) => current + 1),
  };
};
