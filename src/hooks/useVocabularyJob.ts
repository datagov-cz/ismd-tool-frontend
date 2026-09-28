import { useEffect } from 'react';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useGetVocabularySuggestions } from '@/api/generated';
import { pollInterval } from '@/lib/aiPolling';
import { useVocabularyDraftStore } from '@/store/vocabularyDraftStore';

export const useVocabularyJob = () => {
  const t = useTranslations('CreateOntology.AiSuggestion.Job');
  const activeJob = useVocabularyDraftStore((state) => state.activeJob);
  const completeJob = useVocabularyDraftStore((state) => state.completeJob);
  const failJob = useVocabularyDraftStore((state) => state.failJob);
  const cancelJob = useVocabularyDraftStore((state) => state.cancelJob);
  const jobId = activeJob?.jobId;

  const { data, error, isError } = useGetVocabularySuggestions(
    { jobIds: jobId ? [jobId] : [] },
    {
      query: {
        enabled: !!jobId,
        refetchInterval:
          activeJob && jobId ? () => pollInterval(activeJob.startedAt) : false,
        refetchIntervalInBackground: true,
        retry: false,
        gcTime: 0,
      },
    },
  );

  const job = data?.find((item) => item.jobId === jobId);

  useEffect(() => {
    if (!jobId) {
      return;
    }
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      cancelJob(jobId);
      toast.error(t('NotFound'));
      return;
    }
    if (data && !job) {
      cancelJob(jobId);
      toast.error(t('NotFound'));
      return;
    }
    if (job?.status === 'completed') {
      const unchanged = completeJob(job.jobId, job.draft);
      if (unchanged) {
        toast.info(t('NoChange'));
      }
      return;
    }
    if (job?.status === 'failed') {
      failJob(job.jobId, job.draft);
      toast.error(t('Failed'));
    }
  }, [jobId, data, job, error, completeJob, failJob, cancelJob, t]);

  return {
    isReconnecting: isError,
  };
};
