import {
  ConceptDetailModel,
  ConceptMetadataModel,
  SearchResultDto,
} from '@/api/generated';

export type Concept = ConceptDetailModel & {
  iri?: string;
  slug?: string;
  'definiční-obor'?: string;
  metadata?: ConceptMetadataModel | SearchResultDto;
};
export type ConceptKind = 'trida' | 'vlastnost' | 'vztah';

export const getConceptKind = (concept: Concept): ConceptKind => {
  if (concept.metadata?.conceptType === 'VZTAH') return 'vztah';
  if (concept.metadata?.conceptType === 'VLASTNOST') return 'vlastnost';
  return 'trida';
};

export const KIND_LABEL: Record<ConceptKind, string> = {
  trida: 'Třída',
  vlastnost: 'Vlastnost',
  vztah: 'Vztah',
};

export const KIND_ICON: Record<ConceptKind, string> = {
  trida: 'card-heading',
  vlastnost: 'tag',
  vztah: 'bezier2',
};

export const getConceptIri = (concept: Concept): string | undefined =>
  concept.iri;

export const getConceptId = (concept: Concept): string =>
  concept.iri ?? concept.název?.cs ?? '';

export const getDefinicniObor = (concept: Concept): string | undefined =>
  concept['definiční-obor'];

export const getConceptSlug = (concept: Concept): string | undefined =>
  concept.slug;

export const getConceptMetadata = (
  concept: Concept,
): ConceptMetadataModel | undefined => concept.metadata;
