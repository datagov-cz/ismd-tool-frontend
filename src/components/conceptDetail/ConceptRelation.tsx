import { iriToLabel } from '@/lib/concept-utils';

import { Section } from './Section';
import { IriRelatedTerm } from './Term/IriRelatedTerm';

type Props = {
  title: string;
  iri: string;
  pathname: string;
  source: 'NKD' | 'ISMD';
};

export const ConceptRelation = ({ title, iri, pathname, source }: Props) => {
  const label = iriToLabel(iri);
  if (!label) return null;
  return (
    <Section title={title}>
      <IriRelatedTerm iri={iri} pathname={pathname} source={source} />
    </Section>
  );
};
