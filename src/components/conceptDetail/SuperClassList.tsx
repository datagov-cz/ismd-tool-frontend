import { LITERAL_URL_PREFIX, RESOURCE_URL_PREFIX } from '@/lib/constants';

import { RelatedTerm } from './RelatedTerm';

export const SuperClassList = ({
  items,
  pathname,
  source,
}: {
  items?: string[];
  pathname: string;
  source: 'ISMD' | 'NKD';
}) => {
  if (!items || items.length === 0) return null;

  const filteredItems = items.filter(
    (item) => item !== RESOURCE_URL_PREFIX && item !== LITERAL_URL_PREFIX,
  );

  return (
    <>
      {filteredItems.map((item, index) => (
        <RelatedTerm
          key={index + item}
          label={item.split('pojem/')[1]?.replace(/-/g, ' ') || ''}
          href={
            source === 'ISMD'
              ? `${pathname.replace(/^\/|\/$/g, '')}-${item.split('/pojem/')[1]}`
              : `/concept/nkd?iri=${item}`
          }
        />
      ))}
    </>
  );
};
