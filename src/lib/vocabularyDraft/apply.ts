import type {
  AiDraftClassDtoType,
  AiVocabularyDraftDto,
} from '@/api/generated';
import type { DraftItem } from '@/lib/vocabularyDraft/types';

const hasRef = <T extends { ref?: string }>(
  value: T,
): value is T & { ref: string } => !!value.ref;

const toItems = (draft: AiVocabularyDraftDto, jobId: string): DraftItem[] => [
  ...(draft.classes ?? []).filter(hasRef).map((data) => ({
    kind: 'class' as const,
    ref: data.ref,
    data,
    originJobId: jobId,
    revision: 0,
  })),
  ...(draft.attributes ?? []).filter(hasRef).map((data) => ({
    kind: 'attribute' as const,
    ref: data.ref,
    data,
    originJobId: jobId,
    revision: 0,
  })),
  ...(draft.relationships ?? []).filter(hasRef).map((data) => ({
    kind: 'relationship' as const,
    ref: data.ref,
    data,
    originJobId: jobId,
    revision: 0,
  })),
];

export const applyInitial = (
  draft: AiVocabularyDraftDto,
  jobId: string,
): DraftItem[] => toItems(draft, jobId);

export const applyExpand = (
  items: DraftItem[],
  draft: AiVocabularyDraftDto,
  jobId: string,
): DraftItem[] => {
  const existing = new Set(items.map((item) => item.ref));
  return [
    ...items,
    ...toItems(draft, jobId).filter((item) => !existing.has(item.ref)),
  ];
};

export type RegenerateOutcome = 'replaced' | 'empty' | 'stale';

export const applyRegenerate = (
  items: DraftItem[],
  draft: AiVocabularyDraftDto,
  jobId: string,
  targetRef: string,
  startRevision: number,
): { items: DraftItem[]; outcome: RegenerateOutcome } => {
  const replacement = toItems(draft, jobId).find(
    (item) => item.ref === targetRef,
  );
  const current = items.find((item) => item.ref === targetRef);

  if (!replacement || !current) {
    return { items, outcome: 'empty' };
  }
  if (current.revision !== startRevision) {
    return { items, outcome: 'stale' };
  }

  const { name, definition, explanation, legalAct } = replacement.data;

  return {
    items: items.map((item) =>
      item.ref === targetRef
        ? ({
            ...item,
            originJobId: jobId,
            revision: item.revision + 1,
            data: { ...item.data, name, definition, explanation, legalAct },
          } as DraftItem)
        : item,
    ),
    outcome: 'replaced',
  };
};

export type DraftEdit = {
  name: string;
  definition: string;
  type?: AiDraftClassDtoType;
};

export const applyEdit = (
  items: DraftItem[],
  ref: string,
  edit: DraftEdit,
): DraftItem[] =>
  items.map((item) => {
    if (item.ref !== ref) {
      return item;
    }
    const data = {
      ...item.data,
      name: { ...item.data.name, cs: edit.name },
      definition: { ...item.data.definition, cs: edit.definition },
      ...(item.kind === 'class' && edit.type ? { type: edit.type } : {}),
    };
    return { ...item, revision: item.revision + 1, data } as DraftItem;
  });
