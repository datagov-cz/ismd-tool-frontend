import { ConceptDetailModelReferencovanéPojmyResolved } from '@/api/generated';
import { iriToLabel } from '@/lib/concept-utils';

import { Section } from './Section';
import { IriRelatedTerm } from './Term/IriRelatedTerm';

type Props = {
  title: string;
  iri: string;
  resolvedRelations?: ConceptDetailModelReferencovanéPojmyResolved;
};

export const ConceptRelation = ({ title, iri, resolvedRelations }: Props) => {
  const label = iriToLabel(iri);
  if (!label) return null;
  return (
    <Section title={title}>
      <IriRelatedTerm iri={iri} resolved={resolvedRelations} />
    </Section>
  );
};
