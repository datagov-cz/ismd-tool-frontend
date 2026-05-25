import { iriToHref, iriToLabel } from '@/lib/concept-utils';
import { ResolvedConceptsMap } from '@/utils/conceptRelations';

import { RelatedTerm } from './RelatedTerm';

type Props = {
  iri: string;
  resolved: ResolvedConceptsMap;
  source: 'ISMD' | 'NKD';
};

export const IriRelatedTerm = ({ iri, resolved, source }: Props) => {
  const resolvedConcept = resolved[iri];

  const label = iriToLabel(
    resolvedConcept && resolvedConcept.iri ? resolvedConcept.iri : iri,
  );

  const href = iriToHref(
    resolvedConcept && resolvedConcept.iri ? resolvedConcept.iri : iri,
    resolvedConcept && resolvedConcept.source ? resolvedConcept.source : source,
  );

  if (!label) return null;
  return <RelatedTerm label={label} href={href} />;
};
