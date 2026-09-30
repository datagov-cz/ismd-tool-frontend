import type { DraftItem } from '@/lib/vocabularyDraft/types';

export type NamingIssue = 'MissingName' | 'DuplicateName';

export const findNamingIssues = (
  items: DraftItem[],
  selectedRefs: string[],
): Record<string, NamingIssue> => {
  const selected = new Set(selectedRefs);
  const issues: Record<string, NamingIssue> = {};
  const byName = new Map<string, string[]>();

  items
    .filter((item) => selected.has(item.ref))
    .forEach((item) => {
      const name = item.data.name?.cs?.trim() ?? '';
      if (!name) {
        issues[item.ref] = 'MissingName';
        return;
      }
      const key = name.toLocaleLowerCase('cs');
      byName.set(key, [...(byName.get(key) ?? []), item.ref]);
    });

  byName.forEach((refs) => {
    if (refs.length > 1) {
      refs.forEach((ref) => {
        issues[ref] = 'DuplicateName';
      });
    }
  });

  return issues;
};
