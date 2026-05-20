import { RelatedTerm } from './RelatedTerm';
import { Section } from './Section';

type Props = {
  title: string;
  source: string;
  pathname: string;
};

export const ConceptRelation = ({ title, source, pathname }: Props) => {
  const name = source.split('pojem/')[1]?.replace(/-/g, ' ');
  if (!name || name.length === 0) return null;
  return (
    <Section title={title}>
      <div className="space-y-2">
        <RelatedTerm
          key={source}
          label={name}
          href={`${pathname.replace(/^\/|\/$/g, '')}-${source.split('/pojem/')[1]}`}
        />
      </div>
    </Section>
  );
};
