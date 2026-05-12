import { ConceptPropertiesModel } from '@/api/generated';
import { Term } from '../dictionaryDetail/Term';

import { Section } from './Section';

type Props = {
  type: 'VLASTNOST' | 'VZTAH';
  title: string;
  concepts: ConceptPropertiesModel[];
  conceptIRI: string;
  ontologyIRI: string;
  conceptSlug: string;
};

export const AddPropertyRelation = ({
  // type,
  title,
  concepts,
  // conceptIRI,
  // ontologyIRI,
  // conceptSlug,
}: Props) => {
  return (
    <Section title={title} addMore={() => {}}>
      <div className="pl-11.5">
        {concepts?.map((item) => (
          <Term
            key={item.ref}
            slug={item.ref || ''}
            tree={false}
            data={{ název: { cs: item.name || '' } }}
          />
        ))}
      </div>
    </Section>
  );
};
