import type { AiConceptReferenceDto } from '@/api/generated';
import {
  type DraftAttribute,
  type DraftClass,
  type DraftItem,
  type DraftRelationship,
  isAttribute,
  isClass,
  isRelationship,
} from '@/lib/vocabularyDraft/types';

export type ClassGroup = {
  item: DraftClass;
  attributes: DraftAttribute[];
  relationships: DraftRelationship[];
};

export const groupForDisplay = (items: DraftItem[]): ClassGroup[] => {
  const attributes = items.filter(isAttribute);
  const relationships = items.filter(isRelationship);

  return items.filter(isClass).map((item) => ({
    item,
    attributes: attributes.filter(
      (attribute) => attribute.data.associatedClass?.ref === item.ref,
    ),
    relationships: relationships.filter(
      (relationship) => relationship.data.sourceClass?.ref === item.ref,
    ),
  }));
};

export const displayedRefs = (groups: ClassGroup[]): string[] =>
  groups.flatMap(({ item, attributes, relationships }) => [
    item.ref,
    ...attributes.map((attribute) => attribute.ref),
    ...relationships.map((relationship) => relationship.ref),
  ]);

export const resolveTargetLabel = (
  items: DraftItem[],
  reference?: AiConceptReferenceDto,
): string => {
  if (reference?.ref) {
    const target = items.find((item) => item.ref === reference.ref);
    return target?.data.name?.cs ?? reference.ref;
  }
  return reference?.iri?.split(/[/#]/).filter(Boolean).pop() ?? '';
};
