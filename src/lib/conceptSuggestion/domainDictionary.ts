const conceptSegment = '/pojem/';

const decode = (iri: string) => {
  try {
    return decodeURI(iri);
  } catch {
    return iri;
  }
};

const normalize = (iri: string) =>
  decode(iri).normalize('NFC').replace(/\/+$/, '');

export const isSameIri = (left: string, right: string) =>
  normalize(left) === normalize(right);

export const dictionaryIriOfConcept = (iri: string): string | null => {
  const index = iri.lastIndexOf(conceptSegment);
  return index > 0 ? iri.slice(0, index) : null;
};
