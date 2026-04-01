import { LITERAL_URL_PREFIX, RESOURCE_URL_PREFIX } from '@/lib/constants';
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
    (item) => item !== RESOURCE_URL_PREFIX && item !== LITERAL_URL_PREFIX,
  );

  return (
    <>
      {filteredItems.map((item, index) => (
        <Term
          key={item + index}
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
