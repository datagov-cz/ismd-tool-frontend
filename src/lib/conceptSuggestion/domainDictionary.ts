const conceptSegment = '/pojem/';

export const dictionaryIriOfConcept = (iri: string): string | null => {
  const index = iri.lastIndexOf(conceptSegment);
  return index > 0 ? iri.slice(0, index) : null;
};
