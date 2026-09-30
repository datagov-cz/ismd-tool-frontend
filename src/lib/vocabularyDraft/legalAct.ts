import type { LegalActRef } from '@/lib/vocabularyDraft/types';

const ELI_PATTERN =
  /\/eli\/cz\/sb\/(\d{4})\/(\d+)\/(\d{4}-\d{2}-\d{2})(?:\/|$)/;

export const parseLegalActIri = (iri: string): LegalActRef | null => {
  const match = iri.match(ELI_PATTERN);
  if (!match) {
    return null;
  }
  const [, year, number, date] = match;
  return { iri, year: Number(year), number: Number(number), date };
};
