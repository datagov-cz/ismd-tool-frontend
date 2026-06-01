import { ConceptPropertiesModel } from '@/api/generated';

import { Section } from './Section';
import { RelatedTerm } from './Term/RelatedTerm';

type Props = {
  title: string;
  concepts: ConceptPropertiesModel[];
};

export const AddPropertyRelation = ({ title, concepts }: Props) => {
  return (
    <Section title={title}>
      <div className="space-y-2 w-full">
        {concepts?.map((item) => (
          <RelatedTerm
            key={item.name}
            label={item.name || ''}
            href={item.ref || ''}
          />
        ))}
      </div>
    </Section>
  );
};
