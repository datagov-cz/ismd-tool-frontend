import { ConceptDetailModel, ResolvedConceptDto } from '@/api/generated';

export const extractConceptIris = (
  conceptDetail: ConceptDetailModel,
): string[] => {
  const iris: (string | undefined)[] = [
    ...(conceptDetail['ekvivalentní-pojem'] ?? []),
    conceptDetail['definiční-obor'],
    conceptDetail['obor-hodnot'],
    ...(conceptDetail['nadřazená-třída'] ?? []),
    ...(conceptDetail['nadřazený-vztah'] ?? []),
    ...(conceptDetail['nadřazená-vlastnost'] ?? []),
    ...(conceptDetail.conceptProperties?.map((p) => p.ref) ?? []),
    ...(conceptDetail.conceptRelationships?.map((r) => r.ref) ?? []),
  ];

  return [...new Set(iris.filter((iri): iri is string => !!iri))];
};

export type ResolvedConceptsMap = Record<string, ResolvedConceptDto>;
