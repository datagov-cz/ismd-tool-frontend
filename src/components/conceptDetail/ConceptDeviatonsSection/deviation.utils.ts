export const formatKey = (key: string) => {
  const withSpaces = key.replace(/-/g, ' ');
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

export const labelFromIri = (iri?: string): string | undefined => {
  if (!iri) return undefined;
  try {
    const segment = decodeURIComponent(
      new URL(iri).pathname.split('/').filter(Boolean).at(-1) ?? '',
    );
    return formatKey(segment);
  } catch {
    return iri;
  }
};
