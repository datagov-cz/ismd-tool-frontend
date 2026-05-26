import { ConceptDetailModelReferencovanéPojmyResolved } from '@/api/generated';
import { iriToLabel } from '@/lib/concept-utils';

import { RelatedTerm } from './RelatedTerm';

type Props = {
  iri: string;
  resolved?: ConceptDetailModelReferencovanéPojmyResolved;
};

export const IriRelatedTerm = ({ iri, resolved }: Props) => {
  const resolvedConcept = resolved && resolved[iri];

  const label = resolvedConcept
    ? resolvedConcept.conceptName?.cs
    : iriToLabel(iri);

  const href =
    resolvedConcept && resolvedConcept.source !== 'NKD'
      ? `/concept/${resolvedConcept.conceptSlug}`
      : `/concept/nkd?iri=${iri}`;

  if (!label) return null;
  return <RelatedTerm label={label} href={href} />;
};
