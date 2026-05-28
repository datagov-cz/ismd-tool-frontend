import { useCallback, useEffect, useRef, useState } from 'react';
import { FieldValues, useFormContext, useWatch } from 'react-hook-form';

const DEBOUNCE_MS = 300;
const MAX_HISTORY = 100;

export function useFormHistory<T extends FieldValues = FieldValues>() {
  const { reset, getValues } = useFormContext<T>();
  const currentValues = useWatch<T>();

  const history = useRef<T[]>([structuredClone(getValues())]);
  const cursor = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isReplaying = useRef(false);
  const isMounted = useRef(false);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncNavigationState = useCallback(() => {
    setCanUndo(cursor.current > 0);
    setCanRedo(cursor.current < history.current.length - 1);
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isReplaying.current) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      const snapshot = structuredClone(getValues());
      const current = history.current[cursor.current];

      if (JSON.stringify(snapshot) === JSON.stringify(current)) return;

      const newHistory = history.current.slice(0, cursor.current + 1);
      newHistory.push(snapshot);
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      history.current = newHistory;
      cursor.current = newHistory.length - 1;
      syncNavigationState();
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [currentValues, getValues, syncNavigationState]);

  const undo = useCallback(() => {
    if (cursor.current <= 0) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;

      const snapshot = structuredClone(getValues());
      const current = history.current[cursor.current];

      if (JSON.stringify(snapshot) !== JSON.stringify(current)) {
        const newHistory = history.current.slice(0, cursor.current + 1);
        newHistory.push(snapshot);
        history.current = newHistory;
        cursor.current = newHistory.length - 1;
      }
    }

    cursor.current -= 1;
    isReplaying.current = true;
    reset(history.current[cursor.current], { keepDefaultValues: true });
    setTimeout(() => {
      isReplaying.current = false;
    }, DEBOUNCE_MS + 50);
    syncNavigationState();
  }, [getValues, reset, syncNavigationState]);

  const redo = useCallback(() => {
    if (cursor.current >= history.current.length - 1) return;

    cursor.current += 1;
    isReplaying.current = true;
    reset(history.current[cursor.current], { keepDefaultValues: true });
    setTimeout(() => {
      isReplaying.current = false;
    }, DEBOUNCE_MS + 50);
    syncNavigationState();
  }, [reset, syncNavigationState]);

  return { undo, redo, canUndo, canRedo };
}
