export const extractOntologyFromUrl = (graphName: string): string => {
  const url = new URL(graphName);
  return decodeURIComponent(url.pathname)
    .replace(/^\/|\/$/g, '')
    .replace(/-/g, ' ');
};

export const extractDefinicniObor = (
  source: unknown,
  pathname: string,
): { name: string; link: string } | null => {
  if (!source) return null;

  const sourceStr = typeof source === 'string' ? source : String(source);
  const pojem = sourceStr.split('/pojem/')[1];

  if (!pojem) return null;

  const name = pojem.replace(/-/g, ' ');
  const link = `${pathname.replace(/^\/|\/$/g, '')}-${pojem}`;

  return { name, link };
};
