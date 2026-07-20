import { useEffect, useRef } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

export const readFormDraft = <T>(key?: string): T | undefined => {
  if (!key || typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
};

export const clearFormDraft = (key?: string) => {
  if (!key || typeof window === 'undefined') return;
  localStorage.removeItem(key);
};

/**
 * Persists form values to localStorage as the user types and restores them on
 * reload. Restore uses `reset(draft, { keepDefaultValues: true })` so the form's
 * `isDirty` flag keeps comparing against the original base/server defaults — the
 * "Unsaved changes" indicator stays visible after reload. Call `clearFormDraft(key)`
 * once the form is successfully submitted to invalidate the draft.
 */
export function useFormDraft<T extends FieldValues>(
  form: UseFormReturn<T>,
  key?: string,
) {
  const restored = useRef(false);

  // Restore once on mount.
  useEffect(() => {
    if (!key || restored.current) return;
    restored.current = true;
    const draft = readFormDraft<T>(key);
    if (draft) form.reset(draft, { keepDefaultValues: true });
  }, [key, form]);

  // Persist on every change (getValues() for a complete snapshot).
  useEffect(() => {
    if (!key) return;
    const sub = form.watch(() => {
      try {
        localStorage.setItem(key, JSON.stringify(form.getValues()));
      } catch {
        /* ignore quota/serialization errors */
      }
    });
    return () => sub.unsubscribe();
  }, [key, form]);
}
