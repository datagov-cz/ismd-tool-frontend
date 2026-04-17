import { ConceptDetailLink } from './ConceptDetailLink';

export const LinkList = ({
  items,
}: {
  items?: string[] | Array<{ iri: string }>;
}) => {
  if (!items || items.length === 0) return null;

  return (
    <>
      {items.map((item, index) => {
        const href = typeof item === 'string' ? item : item.iri;
        return <ConceptDetailLink key={href + index} href={href || ''} />;
      })}
    </>
  );
};
