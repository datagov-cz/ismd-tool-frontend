'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  type AiAttributeSuggestionDto,
  type AiClassSuggestionDto,
  type AiRelationshipSuggestionDto,
  type Jwt,
  resolveLegalSource,
  startClassSuggestions,
  startPropertySuggestions,
  startRelationshipSuggestions,
  useGetClassSuggestions,
  useGetPropertySuggestions,
  useGetRelationshipSuggestions,
} from '@/api/generated';

const PROXY_HANDLED_JWT = { jwt: undefined as unknown as Jwt };

const POLL_INTERVAL = 2000;

export type AiSuggestedClass = {
  suggestion: AiClassSuggestionDto;
  attributes: AiAttributeSuggestionDto[];
  relationships: AiRelationshipSuggestionDto[];
};

export type AiSuggestionsStatus = 'idle' | 'loading' | 'ready' | 'failed';

export type AiSuggestions = {
  status: AiSuggestionsStatus;
  classes: AiSuggestedClass[];
  jobIdBySuggestionId: Record<string, string>;
  definingLegalSource: string | null;
  retry: () => void;
};

type LegalActRef = {
  year: number;
  number: number;
  date: string;
  fragmentIri: string;
};

const hasPendingJob = (jobs?: { status: string }[]) =>
  jobs?.some((job) => job.status === 'in_progress') ?? false;

const hasFailedJob = (jobs?: { status: string }[]) =>
  jobs?.some((job) => job.status === 'failed') ?? false;

const pollWhileRunning = {
  refetchInterval: (query: { state: { data?: { status: string }[] } }) =>
    hasPendingJob(query.state.data) ? POLL_INTERVAL : false,
};

export const useAiDictionarySuggestions = (
  legalSourceIri: string | null,
): AiSuggestions => {
  const [act, setAct] = useState<LegalActRef | null>(null);
  const [classJobId, setClassJobId] = useState<string | null>(null);
  const [propertyJobIds, setPropertyJobIds] = useState<string[]>([]);
  const [relationshipJobIds, setRelationshipJobIds] = useState<string[]>([]);
  const [startFailed, setStartFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const childJobsStartedFor = useRef<string | null>(null);

  useEffect(() => {
    setAct(null);
    setClassJobId(null);
    setPropertyJobIds([]);
    setRelationshipJobIds([]);
    setStartFailed(false);
    childJobsStartedFor.current = null;

    if (!legalSourceIri) {
      return;
    }

    let cancelled = false;

    const start = async () => {
      try {
        const resolved = (await resolveLegalSource({ iri: legalSourceIri }))
          .data;

        if (
          !resolved?.lawYear ||
          !resolved.lawNumber ||
          !resolved.versionDate ||
          !resolved.fragmentIri
        ) {
          throw new Error('Legal source is missing act coordinates');
        }

        const legalAct: LegalActRef = {
          year: resolved.lawYear,
          number: Number(resolved.lawNumber),
          date: resolved.versionDate,
          fragmentIri: resolved.fragmentIri,
        };

        const started = await startClassSuggestions(
          legalAct.year,
          legalAct.number,
          legalAct.date,
          { structuralElementIds: [legalAct.fragmentIri] },
          PROXY_HANDLED_JWT,
        );

        if (cancelled) {
          return;
        }

        setAct(legalAct);
        setClassJobId(started.jobId);
      } catch {
        if (!cancelled) {
          setStartFailed(true);
        }
      }
    };

    start();

    return () => {
      cancelled = true;
    };
  }, [legalSourceIri, attempt]);

  const classQuery = useGetClassSuggestions(
    { jobIds: classJobId ? [classJobId] : [], ...PROXY_HANDLED_JWT },
    { query: { enabled: !!classJobId, ...pollWhileRunning } },
  );

  const classJob = classQuery.data?.[0];
  const classSuggestions = useMemo(
    () => classJob?.newSuggestions ?? [],
    [classJob],
  );

  useEffect(() => {
    if (!act || !classJob || classJob.status !== 'completed') {
      return;
    }

    if (childJobsStartedFor.current === classJob.jobId) {
      return;
    }

    childJobsStartedFor.current = classJob.jobId;

    if (!classSuggestions.length) {
      return;
    }

    let cancelled = false;

    const startChildJobs = async () => {
      const requests = classSuggestions.map((suggestion) => ({
        selectedClassId: suggestion.suggestionId,
        structuralElementIds: [act.fragmentIri],
      }));

      try {
        const [properties, relationships] = await Promise.all([
          Promise.all(
            requests.map((data) =>
              startPropertySuggestions(
                act.year,
                act.number,
                act.date,
                data,
                PROXY_HANDLED_JWT,
              ),
            ),
          ),
          Promise.all(
            requests.map((data) =>
              startRelationshipSuggestions(
                act.year,
                act.number,
                act.date,
                data,
                PROXY_HANDLED_JWT,
              ),
            ),
          ),
        ]);

        if (cancelled) {
          return;
        }

        setPropertyJobIds(properties.map((job) => job.jobId));
        setRelationshipJobIds(relationships.map((job) => job.jobId));
      } catch {
        if (!cancelled) {
          setStartFailed(true);
        }
      }
    };

    startChildJobs();

    return () => {
      cancelled = true;
    };
  }, [act, classJob, classSuggestions]);

  const propertyQuery = useGetPropertySuggestions(
    { jobIds: propertyJobIds, ...PROXY_HANDLED_JWT },
    { query: { enabled: !!propertyJobIds.length, ...pollWhileRunning } },
  );

  const relationshipQuery = useGetRelationshipSuggestions(
    { jobIds: relationshipJobIds, ...PROXY_HANDLED_JWT },
    { query: { enabled: !!relationshipJobIds.length, ...pollWhileRunning } },
  );

  const propertyJobs = useMemo(
    () => propertyQuery.data ?? [],
    [propertyQuery.data],
  );

  const relationshipJobs = useMemo(
    () => relationshipQuery.data ?? [],
    [relationshipQuery.data],
  );

  const classes = useMemo(
    () =>
      classSuggestions.map((suggestion) => ({
        suggestion,
        attributes: propertyJobs
          .filter((job) => job.selectedClassId === suggestion.suggestionId)
          .flatMap((job) => job.newAttributeSuggestions),
        relationships: relationshipJobs
          .filter((job) => job.selectedClassId === suggestion.suggestionId)
          .flatMap((job) => job.newRelationshipSuggestions),
      })),
    [classSuggestions, propertyJobs, relationshipJobs],
  );

  const jobIdBySuggestionId = useMemo(() => {
    const map: Record<string, string> = {};

    if (classJob) {
      classJob.newSuggestions.forEach((suggestion) => {
        map[suggestion.suggestionId] = classJob.jobId;
      });
    }

    propertyJobs.forEach((job) => {
      job.newAttributeSuggestions.forEach((attribute) => {
        map[attribute.suggestionId] = job.jobId;
      });
    });

    relationshipJobs.forEach((job) => {
      job.newRelationshipSuggestions.forEach((relationship) => {
        map[relationship.suggestionId] = job.jobId;
      });
    });

    return map;
  }, [classJob, propertyJobs, relationshipJobs]);

  const expectedChildJobs = classSuggestions.length;

  const childJobsSettled =
    !expectedChildJobs ||
    (propertyJobs.length === expectedChildJobs &&
      relationshipJobs.length === expectedChildJobs &&
      !hasPendingJob(propertyJobs) &&
      !hasPendingJob(relationshipJobs));

  const failed =
    startFailed ||
    !!classQuery.error ||
    !!propertyQuery.error ||
    !!relationshipQuery.error ||
    hasFailedJob(classQuery.data) ||
    hasFailedJob(propertyJobs) ||
    hasFailedJob(relationshipJobs);

  const status: AiSuggestionsStatus = !legalSourceIri
    ? 'idle'
    : failed
      ? 'failed'
      : classJob?.status === 'completed' && childJobsSettled
        ? 'ready'
        : 'loading';

  return {
    status,
    classes,
    jobIdBySuggestionId,
    definingLegalSource: act?.fragmentIri ?? null,
    retry: () => setAttempt((current) => current + 1),
  };
};
