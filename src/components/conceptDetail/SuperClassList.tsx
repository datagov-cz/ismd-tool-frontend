import { Term } from '../dictionaryDetail/Term';

export const SuperClassList = ({
  items,
  pathname,
}: {
  items?: string[];
  pathname: string;
}) => {
  if (!items || items.length === 0) return null;

  const filteredItems = items.filter(
    (item) =>
      item !== 'http://www.w3.org/2000/01/rdf-schema#Resource' &&
      item !== 'http://www.w3.org/2000/01/rdf-schema#Literal',
  );

  return (
    <>
      {filteredItems.map((item, index) => (
        <Term
          key={index}
          slug={`${pathname.replace(/^\/|\/$/g, '')}-${item.split('/pojem/')[1]}`}
          tree={false}
          data={{
            název: {
              cs: item.split('pojem/')[1]?.replace(/-/g, ' ') || '',
            },
          }}
        />
      ))}
    </>
  );
};
