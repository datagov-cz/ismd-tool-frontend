import { ConceptDetailModel } from '@/api/generated';

export const extractOntologyFromUrl = (graphName: string): string => {
  const url = new URL(graphName);
  return decodeURIComponent(url.pathname)
    .replace(/^\/|\/$/g, '')
    .replace(/-/g, ' ');
};

export const extractDefinicniObor = (
  conceptDetail: ConceptDetailModel,
  pathname: string,
): { name: string; link: string } | null => {
  const definicniOborValue = conceptDetail['definiční-obor'];
  if (!definicniOborValue) return null;

  const name = String(
    definicniOborValue.split('/pojem/')[1]?.replace(/-/g, ' '),
  );
  const link = `${pathname.replace(/^\/|\/$/g, '')}-${definicniOborValue.split('/pojem/')[1]}`;

  return { name, link };
};
