import { LITERAL_URL_PREFIX, RESOURCE_URL_PREFIX } from '@/lib/constants';
import { ResolvedConceptsMap } from '@/utils/conceptRelations';

import { IriRelatedTermList } from './Term/IriRelatedTermList';

export const SuperClassList = ({
  items,
  source,
  resolved,
}: {
  items?: string[];
  source: 'ISMD' | 'NKD';
  resolved: ResolvedConceptsMap;
}) => {
  const filtered = (items ?? []).filter(
    (item) => item !== RESOURCE_URL_PREFIX && item !== LITERAL_URL_PREFIX,
  );
  if (filtered.length === 0) return null;
  return (
    <IriRelatedTermList iris={filtered} source={source} resolved={resolved} />
  );
};
