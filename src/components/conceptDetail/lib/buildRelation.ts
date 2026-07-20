import { ConceptDetailModel } from '@/api/generated';

export type RelationItem = {
  name: string;
  slug: string;
};

type Relation = {
  start: RelationItem;
  middle: RelationItem;
  end: RelationItem;
};

export const buildRelation = (
  conceptDetail: ConceptDetailModel,
  slug: string,
): Relation | undefined => {
  const resolved = conceptDetail['referencované-pojmy-resolved'];

  const toRelationItem = (key?: string): RelationItem | undefined => {
    if (key == null) return undefined;
    const ref = resolved?.[key];
    return ref?.conceptName?.cs && ref?.conceptSlug
      ? { name: ref.conceptName.cs, slug: ref.conceptSlug }
      : undefined;
  };

  const end = toRelationItem(conceptDetail['obor-hodnot']);
  const start = toRelationItem(conceptDetail['definiční-obor']);

  const middle: RelationItem | undefined = conceptDetail['název']?.cs
    ? { name: conceptDetail['název'].cs, slug }
    : undefined;

  return start && middle && end ? { start, middle, end } : undefined;
};
