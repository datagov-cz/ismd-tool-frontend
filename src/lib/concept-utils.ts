import { ResolvedConceptDtoSource } from '@/api/generated';

export const iriToLabel = (iri: string): string =>
  iri.split('pojem/')[1]?.replace(/-/g, ' ') ?? '';

export const iriToHref = (
  iri: string,
  source: ResolvedConceptDtoSource,
): string =>
  source !== 'NKD'
    ? `/concept/${iri.split('/pojem/')[1]}`
    : `/concept/nkd?iri=${iri}`;
