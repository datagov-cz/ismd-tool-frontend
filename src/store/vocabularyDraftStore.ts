import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AiVocabularyDraftDto } from '@/api/generated';
import { draftKeys } from '@/lib/draftKeys';
import {
  applyEdit,
  applyExpand,
  applyInitial,
  applyRegenerate,
  type DraftEdit,
} from '@/lib/vocabularyDraft/apply';
import {
  pruneSelection,
  toggleSelection,
} from '@/lib/vocabularyDraft/selection';
import type {
  ActiveJob,
  DraftItem,
  FeedbackVote,
  LegalActRef,
  PendingJob,
} from '@/lib/vocabularyDraft/types';
import type { NamingIssue } from '@/lib/vocabularyDraft/validation';

export type JobOutcome = 'applied' | 'empty' | 'stale' | 'ignored';

type VocabularyDraftState = {
  legalAct: LegalActRef | null;
  items: DraftItem[];
  selectedRefs: string[];
  activeJob: ActiveJob | null;
  initialFailed: boolean;
  feedback: FeedbackVote | null;
  startingJob: PendingJob | null;
  namingIssues: Record<string, NamingIssue>;
};

type VocabularyDraftActions = {
  setLegalAct: (_legalAct: LegalActRef | null) => void;
  setStartingJob: (_job: PendingJob | null) => void;
  startJob: (_job: ActiveJob) => void;
  completeJob: (_jobId: string, _draft: AiVocabularyDraftDto) => JobOutcome;
  failJob: (_jobId: string, _draft: AiVocabularyDraftDto) => void;
  cancelJob: (_jobId: string) => void;
  editItem: (_ref: string, _edit: DraftEdit) => void;
  toggle: (_ref: string) => void;
  toggleAll: (_refs: string[]) => void;
  setFeedback: (_vote: FeedbackVote) => void;
  setNamingIssues: (_issues: Record<string, NamingIssue>) => void;
  reset: () => void;
};

const initialState: VocabularyDraftState = {
  legalAct: null,
  items: [],
  selectedRefs: [],
  activeJob: null,
  initialFailed: false,
  feedback: null,
  startingJob: null,
  namingIssues: {},
};

const draftReset = {
  items: [],
  selectedRefs: [],
  activeJob: null,
  initialFailed: false,
  feedback: null,
  startingJob: null,
  namingIssues: {},
};

export const useVocabularyDraftStore = create<
  VocabularyDraftState & VocabularyDraftActions
>()(
  persist(
    (set, get) => ({
      ...initialState,
      setLegalAct: (legalAct) => set({ ...draftReset, legalAct }),
      setStartingJob: (startingJob) => set({ startingJob }),
      startJob: (activeJob) => set({ activeJob, startingJob: null }),
      completeJob: (jobId, draft) => {
        const { activeJob, items, selectedRefs } = get();
        if (!activeJob || activeJob.jobId !== jobId) {
          return 'ignored';
        }
        const applied = {
          activeJob: null,
        };
        if (activeJob.op === 'initial') {
          set({
            ...applied,
            items: applyInitial(draft, jobId),
            selectedRefs: [],
            initialFailed: false,
            feedback: null,
          });
          return 'applied';
        }
        if (activeJob.op === 'expand') {
          const nextItems = applyExpand(items, draft, jobId);
          set({ ...applied, items: nextItems, feedback: null });
          return nextItems.length === items.length ? 'empty' : 'applied';
        }
        const result = applyRegenerate(
          items,
          draft,
          jobId,
          activeJob.targetRef,
          activeJob.startRevision,
        );
        set({
          ...applied,
          items: result.items,
          selectedRefs: pruneSelection(result.items, selectedRefs),
        });
        if (result.outcome === 'replaced') {
          return 'applied';
        }
        return result.outcome;
      },
      failJob: (jobId, draft) => {
        const { activeJob } = get();
        if (!activeJob || activeJob.jobId !== jobId) {
          return;
        }
        const failed = {
          activeJob: null,
        };
        if (activeJob.op === 'initial') {
          set({
            ...failed,
            items: applyInitial(draft, jobId),
            selectedRefs: [],
            initialFailed: true,
          });
          return;
        }
        set(failed);
      },
      cancelJob: (jobId) => {
        if (get().activeJob?.jobId === jobId) {
          set({ activeJob: null });
        }
      },
      editItem: (ref, edit) => {
        const namingIssues = Object.fromEntries(
          Object.entries(get().namingIssues).filter(([key]) => key !== ref),
        );
        set({ items: applyEdit(get().items, ref, edit), namingIssues });
      },
      toggle: (ref) =>
        set({
          selectedRefs: toggleSelection(get().items, get().selectedRefs, ref),
          namingIssues: {},
        }),
      toggleAll: (refs) => {
        const { selectedRefs } = get();
        const allSelected =
          refs.length > 0 && refs.every((ref) => selectedRefs.includes(ref));
        set({
          selectedRefs: allSelected ? [] : [...refs],
          namingIssues: {},
        });
      },
      setFeedback: (feedback) => set({ feedback }),
      setNamingIssues: (namingIssues) => set({ namingIssues }),
      reset: () => set(initialState),
    }),
    {
      name: draftKeys.ontologyCreateAi,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({
        legalAct,
        items,
        selectedRefs,
        activeJob,
        initialFailed,
        feedback,
      }) => ({
        legalAct,
        items,
        selectedRefs,
        activeJob,
        initialFailed,
        feedback,
      }),
    },
  ),
);
