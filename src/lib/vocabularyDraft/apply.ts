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
  })),
  ...(draft.attributes ?? []).filter(hasRef).map((data) => ({
    kind: 'attribute' as const,
    ref: data.ref,
    data,
    originJobId: jobId,
  })),
  ...(draft.relationships ?? []).filter(hasRef).map((data) => ({
    kind: 'relationship' as const,
    ref: data.ref,
    data,
    originJobId: jobId,
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

export const applyRegenerate = (
  items: DraftItem[],
  draft: AiVocabularyDraftDto,
  jobId: string,
  targetRef: string,
): { items: DraftItem[]; replaced: boolean } => {
  const replacement = toItems(draft, jobId).find(
    (item) => item.ref === targetRef,
  );

  if (!replacement || !items.some((item) => item.ref === targetRef)) {
    return { items, replaced: false };
  }

  const { name, definition, explanation, legalAct } = replacement.data;

  return {
    items: items.map((item) =>
      item.ref === targetRef
        ? ({
            ...item,
            originJobId: jobId,
            data: { ...item.data, name, definition, explanation, legalAct },
          } as DraftItem)
        : item,
    ),
    replaced: true,
  };
};

export type DraftEdit = {
  name: string;
  definition: string;
  explanation: string;
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
    const trimmedExplanation = edit.explanation.trim();
    const explanation: Record<string, string> = {
      ...(item.data.explanation as Record<string, string> | undefined),
    };
    if (trimmedExplanation) {
      explanation.cs = edit.explanation;
    } else {
      delete explanation.cs;
    }
    const data = {
      ...item.data,
      name: { ...item.data.name, cs: edit.name },
      definition: { ...item.data.definition, cs: edit.definition },
      explanation,
      ...(item.kind === 'class' && edit.type ? { type: edit.type } : {}),
    };
    return { ...item, data } as DraftItem;
  });
