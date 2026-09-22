import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import {
  acceptSuggestions,
  type AiJobStartResponseDto,
  type AiVocabularyExpansionRequestDtoKind,
  dislikeSuggestions,
  expandVocabulary,
  likeSuggestions,
  regenerateVocabularyConcept,
  startVocabularySuggestions,
} from '@/api/generated';
import { useIsOnline } from '@/hooks/useIsOnline';
import { groupByJob } from '@/lib/vocabularyDraft/feedback';
import { displayedRefs, groupForDisplay } from '@/lib/vocabularyDraft/grouping';
import { toKnownModel } from '@/lib/vocabularyDraft/mapping';
import {
  type DraftItem,
  type FeedbackVote,
  INITIAL_GENERATION_COUNTS,
  type LegalActRef,
  type PendingJob,
} from '@/lib/vocabularyDraft/types';
import { useVocabularyDraftStore } from '@/store/vocabularyDraftStore';
import { getErrorMessage } from '@/utils/getErrorMessage';

type ExpandInput = {
  kind: AiVocabularyExpansionRequestDtoKind;
  count: number;
  contextText: string;
  selectedClassId?: string;
};

const optionalText = (value: string) => value.trim() || undefined;

export const acceptSelected = (items: DraftItem[], refs: string[]) => {
  const body = groupByJob(items, refs);
  if (body.length === 0) {
    return;
  }
  acceptSuggestions(body).catch(() => undefined);
};

export const useVocabularyAi = () => {
  const t = useTranslations('CreateOntology.AiSuggestion.Job');
  const isOnline = useIsOnline();
  const legalAct = useVocabularyDraftStore((state) => state.legalAct);
  const activeJob = useVocabularyDraftStore((state) => state.activeJob);
  const startingJob = useVocabularyDraftStore((state) => state.startingJob);

  const canRun = isOnline && !!legalAct && !activeJob && !startingJob;

  const run = async (
    request: (_legalAct: LegalActRef) => Promise<AiJobStartResponseDto>,
    pending: PendingJob,
  ) => {
    const store = useVocabularyDraftStore.getState();
    if (!store.legalAct || store.activeJob || store.startingJob || !isOnline) {
      return;
    }
    const startedFor = store.legalAct.iri;
    store.setStartingJob(pending);
    try {
      const { jobId } = await request(store.legalAct);
      const current = useVocabularyDraftStore.getState();
      if (!current.startingJob || current.legalAct?.iri !== startedFor) {
        return;
      }
      current.startJob({ ...pending, jobId, startedAt: Date.now() });
    } catch (error) {
      const current = useVocabularyDraftStore.getState();
      if (current.legalAct?.iri !== startedFor) {
        return;
      }
      current.setStartingJob(null);
      toast.error(getErrorMessage(error, () => t('StartError')));
    }
  };

  const generate = () =>
    run(
      ({ iri, year, number, date }) =>
        startVocabularySuggestions(year, number, date, {
          structuralElementIds: [iri],
          ...INITIAL_GENERATION_COUNTS,
          knownConceptualModel: toKnownModel([]),
        }),
      { op: 'initial' },
    );

  const expand = ({ kind, count, contextText, selectedClassId }: ExpandInput) =>
    run(
      ({ iri, year, number, date }) =>
        expandVocabulary(year, number, date, {
          structuralElementIds: [iri],
          kind,
          count,
          selectedClassId,
          contextText: optionalText(contextText),
          knownConceptualModel: toKnownModel(
            useVocabularyDraftStore.getState().items,
          ),
        }),
      { op: 'expand', kind, selectedClassId },
    );

  const regenerate = (ref: string, contextText: string) => {
    const item = useVocabularyDraftStore
      .getState()
      .items.find((entry) => entry.ref === ref);
    if (!item) {
      return Promise.resolve();
    }
    return run(
      ({ iri, year, number, date }) =>
        regenerateVocabularyConcept(year, number, date, {
          structuralElementIds: [iri],
          conceptRef: ref,
          contextText: optionalText(contextText),
          knownConceptualModel: toKnownModel(
            useVocabularyDraftStore.getState().items,
          ),
        }),
      { op: 'regenerate', targetRef: ref, startRevision: item.revision },
    );
  };

  const vote = (value: FeedbackVote) => {
    const { items, setFeedback } = useVocabularyDraftStore.getState();
    const body = groupByJob(items, displayedRefs(groupForDisplay(items)));
    if (body.length === 0) {
      return;
    }
    setFeedback(value);
    const send = value === 'like' ? likeSuggestions : dislikeSuggestions;
    send(body).catch(() => undefined);
  };

  return { canRun, generate, expand, regenerate, vote };
};
