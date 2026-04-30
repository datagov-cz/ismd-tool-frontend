import { useEffect } from 'react';

import { VisitedEntry } from '@/components/visitedOntologies/VisitedOntologies';

const MAX_VISITED = 6;

export const useVisitedOntology = (
  entry: Omit<VisitedEntry, never> | null,
  userId?: string,
) => {
  useEffect(() => {
    if (!entry || !userId) return;

    const storageKey = `dictionarySlugs_${userId}`;
    const stored = localStorage.getItem(storageKey);
    let entries: VisitedEntry[] = stored ? JSON.parse(stored) : [];

    entries = [
      entry,
      ...entries.filter(
        (e) => !(e.slug === entry.slug && e.source === entry.source),
      ),
    ].slice(0, MAX_VISITED);

    localStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entry?.slug, entry?.source, userId]);
};
