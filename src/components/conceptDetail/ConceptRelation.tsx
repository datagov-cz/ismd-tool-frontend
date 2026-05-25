import { iriToLabel } from '@/lib/concept-utils';
import { ResolvedConceptsMap } from '@/utils/conceptRelations';

import { Section } from './Section';
import { IriRelatedTerm } from './Term/IriRelatedTerm';

type Props = {
  title: string;
  iri: string;
  source: 'NKD' | 'ISMD';
  resolvedRelations: ResolvedConceptsMap;
};

export const ConceptRelation = ({
  title,
  iri,
  source,
  resolvedRelations,
}: Props) => {
  const label = iriToLabel(iri);
  if (!label) return null;
  return (
    <Section title={title}>
      <IriRelatedTerm iri={iri} source={source} resolved={resolvedRelations} />
    </Section>
  );
};
