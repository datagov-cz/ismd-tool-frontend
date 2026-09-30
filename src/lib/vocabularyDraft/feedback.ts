import type { AiFeedbackRequestDto } from '@/api/generated';
import type { DraftItem } from '@/lib/vocabularyDraft/types';

export const groupByJob = (
  items: DraftItem[],
  refs: string[],
): AiFeedbackRequestDto[] => {
  const wanted = new Set(refs);
  const groups = new Map<string, string[]>();

  items
    .filter((item) => wanted.has(item.ref))
    .forEach((item) => {
      groups.set(item.originJobId, [
        ...(groups.get(item.originJobId) ?? []),
        item.ref,
      ]);
    });

  return [...groups].map(([jobId, suggestionIds]) => ({
    jobId,
    suggestionIds,
  }));
};
