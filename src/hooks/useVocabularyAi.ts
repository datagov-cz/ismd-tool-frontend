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
  type JobOp,
  type LegalActRef,
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

  const canRun = isOnline && !!legalAct && !activeJob;

  const run = async (
    request: (_legalAct: LegalActRef) => Promise<AiJobStartResponseDto>,
    job: JobOp,
  ) => {
    const store = useVocabularyDraftStore.getState();
    if (!store.legalAct || store.activeJob || !isOnline) {
      return;
    }
    const pending = store.requestJob(job);
    try {
      const { jobId } = await request(store.legalAct);
      useVocabularyDraftStore.getState().startJob(pending, jobId);
    } catch (error) {
      if (!useVocabularyDraftStore.getState().cancelRequest(pending)) {
        return;
      }
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
    const exists = useVocabularyDraftStore
      .getState()
      .items.some((entry) => entry.ref === ref);
    if (!exists) {
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
      { op: 'regenerate', targetRef: ref },
    );
  };

  const vote = (value: FeedbackVote) => {
    const { items } = useVocabularyDraftStore.getState();
    const body = groupByJob(items, displayedRefs(groupForDisplay(items)));
    if (body.length === 0) {
      return false;
    }
    const send = value === 'like' ? likeSuggestions : dislikeSuggestions;
    send(body).catch(() => undefined);
    return true;
  };

  return { canRun, generate, expand, regenerate, vote };
};
