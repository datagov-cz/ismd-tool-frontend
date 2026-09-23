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
import { toggleSelection } from '@/lib/vocabularyDraft/selection';
import type {
  ActiveJob,
  DraftItem,
  JobOp,
  LegalActRef,
} from '@/lib/vocabularyDraft/types';
import type { NamingIssue } from '@/lib/vocabularyDraft/validation';

type VocabularyDraftState = {
  legalAct: LegalActRef | null;
  items: DraftItem[];
  selectedRefs: string[];
  activeJob: ActiveJob | null;
  initialFailed: boolean;
  namingIssues: Record<string, NamingIssue>;
};

type VocabularyDraftActions = {
  setLegalAct: (_legalAct: LegalActRef | null) => void;
  requestJob: (_job: JobOp) => ActiveJob;
  startJob: (_pending: ActiveJob, _jobId: string) => void;
  cancelRequest: (_pending: ActiveJob) => boolean;
  completeJob: (_jobId: string, _draft: AiVocabularyDraftDto) => boolean;
  failJob: (_jobId: string, _draft: AiVocabularyDraftDto) => void;
  cancelJob: (_jobId: string) => void;
  editItem: (_ref: string, _edit: DraftEdit) => void;
  toggle: (_ref: string) => void;
  toggleAll: (_refs: string[]) => void;
  setNamingIssues: (_issues: Record<string, NamingIssue>) => void;
  reset: () => void;
};

const initialState: VocabularyDraftState = {
  legalAct: null,
  items: [],
  selectedRefs: [],
  activeJob: null,
  initialFailed: false,
  namingIssues: {},
};

export const useVocabularyDraftStore = create<
  VocabularyDraftState & VocabularyDraftActions
>()(
  persist(
    (set, get) => ({
      ...initialState,
      setLegalAct: (legalAct) => set({ ...initialState, legalAct }),
      requestJob: (job) => {
        const pending = { ...job, jobId: null, startedAt: Date.now() };
        set({ activeJob: pending });
        return pending;
      },
      startJob: (pending, jobId) => {
        if (get().activeJob !== pending) {
          return;
        }
        set({ activeJob: { ...pending, jobId, startedAt: Date.now() } });
      },
      cancelRequest: (pending) => {
        if (get().activeJob !== pending) {
          return false;
        }
        set({ activeJob: null });
        return true;
      },
      completeJob: (jobId, draft) => {
        const { activeJob, items } = get();
        if (!activeJob || activeJob.jobId !== jobId) {
          return false;
        }
        if (activeJob.op === 'initial') {
          set({
            activeJob: null,
            items: applyInitial(draft, jobId),
            selectedRefs: [],
            initialFailed: false,
          });
          return false;
        }
        if (activeJob.op === 'expand') {
          const nextItems = applyExpand(items, draft, jobId);
          set({ activeJob: null, items: nextItems });
          return nextItems.length === items.length;
        }
        const result = applyRegenerate(
          items,
          draft,
          jobId,
          activeJob.targetRef,
        );
        set({ activeJob: null, items: result.items });
        return !result.replaced;
      },
      failJob: (jobId, draft) => {
        const { activeJob } = get();
        if (!activeJob || activeJob.jobId !== jobId) {
          return;
        }
        if (activeJob.op === 'initial') {
          set({
            activeJob: null,
            items: applyInitial(draft, jobId),
            selectedRefs: [],
            initialFailed: true,
          });
          return;
        }
        set({ activeJob: null });
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
      }) => ({
        legalAct,
        items,
        selectedRefs,
        activeJob: activeJob?.jobId ? activeJob : null,
        initialFailed,
      }),
    },
  ),
);
