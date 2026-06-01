export const iriToLabel = (iri: string): string =>
  iri.split('pojem/')[1]?.replace(/-/g, ' ') ?? '';
