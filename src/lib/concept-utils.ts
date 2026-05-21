export const iriToLabel = (iri: string): string =>
  iri.split('pojem/')[1]?.replace(/-/g, ' ') ?? '';

export const iriToHref = (
  iri: string,
  pathname: string,
  source: 'ISMD' | 'NKD',
): string =>
  source === 'ISMD'
    ? `${pathname.replace(/^\/|\/$/g, '')}-${iri.split('/pojem/')[1]}`
    : `/concept/nkd?iri=${iri}`;
