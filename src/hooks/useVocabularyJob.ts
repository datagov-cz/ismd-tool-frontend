import { useEffect } from 'react';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useGetVocabularySuggestions } from '@/api/generated';
import { useVocabularyDraftStore } from '@/store/vocabularyDraftStore';

const POLL_STEPS = [
  { until: 30_000, interval: 2_000 },
  { until: 120_000, interval: 5_000 },
];

const SLOW_POLL_INTERVAL = 10_000;

const pollInterval = (startedAt: number) => {
  const elapsed = Date.now() - startedAt;
  return (
    POLL_STEPS.find((step) => elapsed < step.until)?.interval ??
    SLOW_POLL_INTERVAL
  );
};

export const useVocabularyJob = () => {
  const t = useTranslations('CreateOntology.AiSuggestion.Job');
  const activeJob = useVocabularyDraftStore((state) => state.activeJob);
  const completeJob = useVocabularyDraftStore((state) => state.completeJob);
  const failJob = useVocabularyDraftStore((state) => state.failJob);
  const cancelJob = useVocabularyDraftStore((state) => state.cancelJob);

  const { data, error, isError } = useGetVocabularySuggestions(
    { jobIds: activeJob ? [activeJob.jobId] : [] },
    {
      query: {
        enabled: !!activeJob,
        refetchInterval: activeJob
          ? () => pollInterval(activeJob.startedAt)
          : false,
        refetchIntervalInBackground: true,
        retry: false,
        gcTime: 0,
      },
    },
  );

  const job = data?.find((item) => item.jobId === activeJob?.jobId);

  useEffect(() => {
    if (!activeJob) {
      return;
    }
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      cancelJob(activeJob.jobId);
      toast.error(t('NotFound'));
      return;
    }
    if (data && !job) {
      cancelJob(activeJob.jobId);
      toast.error(t('NotFound'));
      return;
    }
    if (job?.status === 'completed') {
      const outcome = completeJob(job.jobId, job.draft);
      if (outcome === 'stale') {
        toast.info(t('Stale'));
      }
      if (outcome === 'empty') {
        toast.info(t('NoChange'));
      }
      return;
    }
    if (job?.status === 'failed') {
      failJob(job.jobId, job.draft);
      toast.error(t('Failed'));
    }
  }, [activeJob, data, job, error, completeJob, failJob, cancelJob, t]);

  return {
    isReconnecting: isError,
  };
};
