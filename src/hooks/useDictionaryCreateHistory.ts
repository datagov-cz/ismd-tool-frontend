import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import type { OntologySchemaType } from '@/lib/formSchemas';
import { useVocabularyDraftStore } from '@/store/vocabularyDraftStore';

const DEBOUNCE_MS = 300;
const MAX_HISTORY = 100;

const getDraftSnapshot = (state = useVocabularyDraftStore.getState()) => ({
  legalAct: state.legalAct,
  items: state.items,
  selectedRefs: state.selectedRefs,
  initialFailed: state.initialFailed,
});

type Snapshot = {
  form: OntologySchemaType;
  draft: ReturnType<typeof getDraftSnapshot>;
};

const isEqual = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);

export function useDictionaryCreateHistory(
  form: UseFormReturn<OntologySchemaType>,
) {
  const navigation = useRef<{ undo: () => void; redo: () => void } | null>(
    null,
  );
  const [availability, setAvailability] = useState({
    canUndo: false,
    canRedo: false,
  });

  useEffect(() => {
    const getSnapshot = (): Snapshot => ({
      form: form.getValues(),
      draft: getDraftSnapshot(),
    });
    let history = [structuredClone(getSnapshot())];
    let cursor = 0;
    let replaying = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const clearTimer = () => {
      clearTimeout(timer);
      timer = undefined;
    };

    const sync = () => {
      const pending = !isEqual(getSnapshot(), history[cursor]);
      setAvailability({
        canUndo: cursor > 0 || pending,
        canRedo: !pending && cursor < history.length - 1,
      });
    };

    const commit = (snapshot: Snapshot) => {
      if (isEqual(snapshot, history[cursor])) return;
      history = history.slice(0, cursor + 1);
      history.push(structuredClone(snapshot));
      if (history.length > MAX_HISTORY) history.shift();
      cursor = history.length - 1;
    };

    const restore = () => {
      const snapshot = structuredClone(history[cursor]);
      replaying = true;
      try {
        // AI-only undo must not reset the form or restart its IRI validation.
        if (!isEqual(form.getValues(), snapshot.form)) {
          form.reset(snapshot.form, { keepDefaultValues: true });
        }
        useVocabularyDraftStore.setState({
          ...snapshot.draft,
          namingIssues: {},
        });
      } finally {
        replaying = false;
      }
      sync();
    };

    navigation.current = {
      undo: () => {
        if (useVocabularyDraftStore.getState().activeJob) return;
        clearTimer();
        commit(getSnapshot());
        if (cursor > 0) {
          cursor -= 1;
          restore();
        }
      },
      redo: () => {
        if (useVocabularyDraftStore.getState().activeJob) return;
        clearTimer();
        commit(getSnapshot());
        if (cursor < history.length - 1) {
          cursor += 1;
          restore();
        } else {
          sync();
        }
      },
    };

    const formSubscription = form.watch(() => {
      if (replaying) return;
      clearTimer();
      sync();
      timer = setTimeout(() => {
        timer = undefined;
        commit(getSnapshot());
        sync();
      }, DEBOUNCE_MS);
    });

    const unsubscribeDraft = useVocabularyDraftStore.subscribe(
      (state, previous) => {
        if (
          replaying ||
          isEqual(getDraftSnapshot(state), getDraftSnapshot(previous))
        ) {
          return;
        }
        clearTimer();
        // Keep pending typing separate from an AI result arriving within the debounce.
        commit({ form: form.getValues(), draft: getDraftSnapshot(previous) });
        commit(getSnapshot());
        sync();
      },
    );

    return () => {
      clearTimer();
      formSubscription.unsubscribe();
      unsubscribeDraft();
      navigation.current = null;
    };
  }, [form]);

  const undo = useCallback(() => navigation.current?.undo(), []);
  const redo = useCallback(() => navigation.current?.redo(), []);

  return { ...availability, undo, redo };
}
