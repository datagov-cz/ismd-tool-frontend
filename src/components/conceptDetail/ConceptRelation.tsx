import { RelatedTerm } from './RelatedTerm';
import { Section } from './Section';

type Props = {
  title: string;
  iri: string;
  pathname: string;
  source: 'NKD' | 'ISMD';
};

export const ConceptRelation = ({ title, iri, pathname, source }: Props) => {
  const name = iri.split('pojem/')[1]?.replace(/-/g, ' ');
  if (!name || name.length === 0) return null;
  return (
    <Section title={title}>
      <div className="space-y-2">
        <RelatedTerm
          key={iri}
          label={name}
          href={
            source === 'ISMD'
              ? `${pathname.replace(/^\/|\/$/g, '')}-${iri.split('/pojem/')[1]}`
              : `/concept/nkd?iri=${iri}`
          }
        />
      </div>
    </Section>
  );
};
