import {
  ConceptDetailModel,
  ConceptMetadataModel,
  SearchResultDto,
} from '@/api/generated';

export type Concept = ConceptDetailModel & {
  iri?: string;
  slug?: string;
  stale?: boolean;
  'definiční-obor'?: string;
  metadata?: ConceptMetadataModel | SearchResultDto;
};
export type ConceptKind = 'trida' | 'vlastnost' | 'vztah';

export const getConceptKind = (concept: Concept): ConceptKind => {
  if (concept.metadata?.conceptType === 'VZTAH') return 'vztah';
  if (concept.metadata?.conceptType === 'VLASTNOST') return 'vlastnost';
  return 'trida';
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

export const getLabelFromConceptIri = (iri?: string): string | undefined => {
  if (!iri) return undefined;

  const marker = '/pojem/';
  const markerIndex = iri.lastIndexOf(marker);
  if (markerIndex === -1) return undefined;

  const encodedName = iri
    .slice(markerIndex + marker.length)
    .split(/[?#]/, 1)[0];
  if (!encodedName) return undefined;

  try {
    return decodeURIComponent(encodedName).replaceAll('-', ' ');
  } catch {
    return encodedName.replaceAll('-', ' ');
  }
};

export const getConceptLabel = (concept: Concept): string | undefined =>
  concept.název?.cs ??
  (concept.metadata && 'label' in concept.metadata
    ? concept.metadata.label
    : undefined) ??
  getLabelFromConceptIri(getConceptIri(concept));

export const getConceptMetadata = (
  concept: Concept,
): ConceptMetadataModel | undefined => concept.metadata;
