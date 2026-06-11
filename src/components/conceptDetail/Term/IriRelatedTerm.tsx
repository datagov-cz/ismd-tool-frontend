import {
  ConceptDetailModelReferencovanéPojmyResolved,
  ConceptMetadataModelConceptType,
} from '@/api/generated';
import { iriToLabel } from '@/lib/concept-utils';

import { ClassRelationTerm } from './ClassRelationTerm';
import { RelatedTerm } from './RelatedTerm';

type Props = {
  iri: string;
  resolved?: ConceptDetailModelReferencovanéPojmyResolved;
  type?: ConceptMetadataModelConceptType;
};

export const IriRelatedTerm = ({ iri, resolved, type }: Props) => {
  const resolvedConcept = resolved && resolved[iri];

  const label = resolvedConcept
    ? resolvedConcept.conceptName?.cs
    : iriToLabel(iri);

  const href =
    resolvedConcept && resolvedConcept.source !== 'NKD'
      ? `/concept/${resolvedConcept.conceptSlug}`
      : `/concept/nkd?iri=${iri}`;

  if (!label) return null;
  if (resolvedConcept && 'resolvedRange' in resolvedConcept)
    return <ClassRelationTerm key={iri} relation={resolvedConcept} />;
  return (
    <RelatedTerm
      label={label}
      href={href}
      ontologyLabel={resolvedConcept?.ontologyName?.cs}
      type={
        type
          ? type
          : resolvedConcept &&
              'resolvedDomain' in resolvedConcept &&
              !('resolvedRange' in resolvedConcept)
            ? 'VLASTNOST'
            : undefined
      }
    />
  );
};
