import { iriToHref, iriToLabel } from '@/lib/concept-utils';

import { RelatedTerm } from './RelatedTerm';

type Props = {
  iri: string;
  pathname: string;
  source: 'ISMD' | 'NKD';
};

export const IriRelatedTerm = ({ iri, pathname, source }: Props) => {
  const label = iriToLabel(iri);
  if (!label) return null;
  return <RelatedTerm label={label} href={iriToHref(iri, pathname, source)} />;
};
