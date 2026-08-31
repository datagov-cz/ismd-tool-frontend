'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  type AiAttributeSuggestionDto,
  type AiRelationshipSuggestionDto,
  startPropertySuggestions,
  startRelationshipSuggestions,
  useGetPropertySuggestions,
  useGetRelationshipSuggestions,
} from '@/api/generated';
import {
  hasFailedJob,
  pollWhileRunning,
  PROXY_HANDLED_JWT,
} from '@/lib/aiSuggestionJobs';

export type AiSuggestionKind = 'property' | 'relationship';

export type LegalActRef = {
  year: number;
  number: number;
  date: string;
  fragmentIri: string;
};

export type AiClassSuggestionsStatus = 'idle' | 'loading' | 'ready' | 'failed';

export type AiClassSuggestions = {
  status: AiClassSuggestionsStatus;
  properties: AiAttributeSuggestionDto[];
  relationships: AiRelationshipSuggestionDto[];
  jobId: string | null;
  retry: () => void;
};

type JobState = {
  key: string | null;
  jobId: string | null;
  startFailed: boolean;
};

const NO_JOB: JobState = { key: null, jobId: null, startFailed: false };

export const useAiClassSuggestions = (
  kind: AiSuggestionKind,
  legalAct: LegalActRef | null,
  classIri: string | null,
  ontologySlug: string | null,
  enabled = true,
): AiClassSuggestions => {
  const [attempt, setAttempt] = useState(0);
  const [job, setJob] = useState<JobState>(NO_JOB);

  const startedFor = useRef<string | null>(null);

  const canStart = enabled && !!legalAct && !!classIri && !!ontologySlug;

  const jobKey = canStart
    ? `${kind}|${legalAct.fragmentIri}|${classIri}|${ontologySlug}#${attempt}`
    : null;

  const activeJob = job.key === jobKey ? job : NO_JOB;

  useEffect(() => {
    if (!legalAct || !classIri || !ontologySlug || !jobKey) {
      return;
    }

    if (startedFor.current === jobKey) {
      return;
    }

    startedFor.current = jobKey;

    let cancelled = false;

    const start = async () => {
      const request = {
        selectedClassId: classIri,
        structuralElementIds: [legalAct.fragmentIri],
        knownConceptualModelSlugs: [ontologySlug],
      };

      const startJob =
        kind === 'property'
          ? startPropertySuggestions
          : startRelationshipSuggestions;

      try {
        const started = await startJob(
          legalAct.year,
          legalAct.number,
          legalAct.date,
          request,
          PROXY_HANDLED_JWT,
        );

        if (cancelled) {
          return;
        }

        setJob({ key: jobKey, jobId: started.jobId, startFailed: false });
      } catch {
        if (!cancelled) {
          setJob({ key: jobKey, jobId: null, startFailed: true });
        }
      }
    };

    start();

    return () => {
      cancelled = true;
    };
  }, [kind, legalAct, classIri, ontologySlug, jobKey]);

  const jobIds = activeJob.jobId ? [activeJob.jobId] : [];

  const propertyQuery = useGetPropertySuggestions(
    { jobIds, ...PROXY_HANDLED_JWT },
    {
      query: {
        enabled: kind === 'property' && !!activeJob.jobId,
        ...pollWhileRunning,
      },
    },
  );

  const relationshipQuery = useGetRelationshipSuggestions(
    { jobIds, ...PROXY_HANDLED_JWT },
    {
      query: {
        enabled: kind === 'relationship' && !!activeJob.jobId,
        ...pollWhileRunning,
      },
    },
  );

  const query = kind === 'property' ? propertyQuery : relationshipQuery;
  const propertyJob = propertyQuery.data?.[0];
  const relationshipJob = relationshipQuery.data?.[0];

  const properties = useMemo(
    () =>
      kind === 'property' ? (propertyJob?.newAttributeSuggestions ?? []) : [],
    [kind, propertyJob],
  );

  const relationships = useMemo(
    () =>
      kind === 'relationship'
        ? (relationshipJob?.newRelationshipSuggestions ?? [])
        : [],
    [kind, relationshipJob],
  );

  const settledJob = kind === 'property' ? propertyJob : relationshipJob;

  const failed =
    activeJob.startFailed || !!query.error || hasFailedJob(query.data);

  const status: AiClassSuggestionsStatus = !canStart
    ? 'idle'
    : failed
      ? 'failed'
      : settledJob?.status === 'completed'
        ? 'ready'
        : 'loading';

  return {
    status,
    properties,
    relationships,
    jobId: settledJob?.jobId ?? null,
    retry: () => setAttempt((current) => current + 1),
  };
};
