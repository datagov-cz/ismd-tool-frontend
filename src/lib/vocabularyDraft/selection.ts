import type { AiConceptReferenceDto } from '@/api/generated';
import type { DraftItem } from '@/lib/vocabularyDraft/types';

const refOf = (reference?: AiConceptReferenceDto) => reference?.ref;

const isString = (value: string | undefined): value is string => !!value;

const dependenciesOf = (item: DraftItem): string[] => {
  if (item.kind === 'class') {
    return (item.data.specializes ?? []).map(refOf).filter(isString);
  }
  if (item.kind === 'attribute') {
    return [refOf(item.data.associatedClass)].filter(isString);
  }
  return [refOf(item.data.sourceClass), refOf(item.data.targetClass)].filter(
    isString,
  );
};

const addWithDependencies = (
  items: DraftItem[],
  selected: Set<string>,
  ref: string,
) => {
  const byRef = new Map(items.map((item) => [item.ref, item]));
  const stack = [ref];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined || selected.has(current)) {
      continue;
    }
    const item = byRef.get(current);
    if (!item) {
      continue;
    }
    selected.add(current);
    stack.push(...dependenciesOf(item));
  }
};

const removeWithDependents = (
  items: DraftItem[],
  selected: Set<string>,
  ref: string,
) => {
  const stack = [ref];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined || !selected.has(current)) {
      continue;
    }
    selected.delete(current);
    items
      .filter((item) => dependenciesOf(item).includes(current))
      .forEach((item) => stack.push(item.ref));
  }
};

export const toggleSelection = (
  items: DraftItem[],
  selectedRefs: string[],
  ref: string,
): string[] => {
  const selected = new Set(selectedRefs);
  if (selected.has(ref)) {
    removeWithDependents(items, selected, ref);
  } else {
    addWithDependencies(items, selected, ref);
  }
  return [...selected];
};

export const pruneSelection = (
  items: DraftItem[],
  selectedRefs: string[],
): string[] => {
  const existing = new Set(items.map((item) => item.ref));
  return selectedRefs.filter((ref) => existing.has(ref));
};
