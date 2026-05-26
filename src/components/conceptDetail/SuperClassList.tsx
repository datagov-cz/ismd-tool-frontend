import { ConceptDetailModelReferencovanéPojmyResolved } from '@/api/generated';
import { LITERAL_URL_PREFIX, RESOURCE_URL_PREFIX } from '@/lib/constants';

import { IriRelatedTermList } from './Term/IriRelatedTermList';

export const SuperClassList = ({
  items,
  resolved,
}: {
  items?: string[];
  resolved?: ConceptDetailModelReferencovanéPojmyResolved;
}) => {
  const filtered = (items ?? []).filter(
    (item) => item !== RESOURCE_URL_PREFIX && item !== LITERAL_URL_PREFIX,
  );
  if (filtered.length === 0) return null;
  return <IriRelatedTermList iris={filtered} resolved={resolved} />;
};
