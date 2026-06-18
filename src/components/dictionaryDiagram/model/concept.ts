import { ConceptDetailModel } from '@/api/generated';

/**
 * Domain alias: the generated model plus fields it doesn't expose natively.
 * `slug` is attached at the API boundary (matched from ontologyMetadata.concepts
 * by IRI); `iri` and `definiční-obor` exist on the wire but aren't in the
 * generated type yet. If/when the model grows these, remove them here —
 * ideally via a `toConcept(raw)` mapper so the app never sees the raw shape.
 */
export type Concept = ConceptDetailModel & {
  iri?: string;
  slug?: string;
  'definiční-obor'?: string;
};

export type ConceptKind = 'trida' | 'vlastnost' | 'vztah';

export const getConceptKind = (concept: Concept): ConceptKind => {
  if (concept.typ?.includes('Vztah')) return 'vztah';
  if (concept.typ?.includes('Vlastnost')) return 'vlastnost';
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

// --- identity / relationship helpers ---------------------------------------
//
// Fields not yet in the generated model are declared on the Concept
// intersection above, so these are plain reads — no casts.

export const getConceptIri = (concept: Concept): string | undefined =>
  concept.iri;

/**
 * Stable identity for a concept. Falls back to the Czech name when no IRI is
 * present — NOTE: names are not guaranteed unique, so this fallback can collide
 * and silently break dedup / active-state. Prefer a real IRI on every concept.
 */
export const getConceptId = (concept: Concept): string =>
  concept.iri ?? concept.název?.cs ?? '';

/** Domain of a Vlastnost/Vztah = IRI of the Třída it belongs to. */
export const getDefinicniObor = (concept: Concept): string | undefined =>
  concept['definiční-obor'];

/** Slug for /concept routes. Attached at the API boundary (see Concept). */
export const getConceptSlug = (concept: Concept): string | undefined =>
  concept.slug;
