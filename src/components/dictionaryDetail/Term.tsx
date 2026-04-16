import { useState } from 'react';
import { GovChip } from '@gov-design-system-ce/react';
import clsx from 'clsx';

import { ConceptDetailModel } from '@/api/generated';

export type TermProps = {
  data: ConceptDetailModel;
  subterms?: { data: ConceptDetailModel; slug: string }[];
  tree?: boolean;
  slug?: string;
};

export const Term = ({ data, subterms, tree, slug }: TermProps) => {
  const [hover, setHover] = useState(false);
  const name = data.název?.cs;
  const capitalizedName = name && name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <div
      className={clsx(
        'relative w-fit group block',
        !subterms &&
          tree &&
          'pl-4 not-last:border-l-2 not-last:border-blue-primary/30',
      )}
    >
      {!subterms && (
        <span
          className={clsx(
            'absolute w-3 h-5.5 border-b-2 border-blue-primary/30 -left-0',
            tree && 'group-last:border-l-2',
          )}
        />
      )}
      <a href={`${process.env.NEXT_PUBLIC_BASE_PATH}/concept/${slug}`}>
        <GovChip
          color="primary"
          size="m"
          type="outlined"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="relative"
        >
          <span className="cursor-pointer">{capitalizedName}</span>
          {(data.definice?.cs || data.popis?.cs) && hover && (
            <Tooltip message={data.definice?.cs || data.popis?.cs || ''} />
          )}
        </GovChip>
      </a>

      <div className="pl-6 pt-2">
        {subterms &&
          subterms.map((item, index) => (
            <Term
              key={data.iri || index}
              data={item.data}
              slug={item.slug}
              tree
            />
          ))}
      </div>
    </div>
  );
};

export const Tooltip = ({ message }: { message: string }) => {
  return (
    <div className="absolute -right-4 top-1/2 translate-x-full -translate-y-1/2 z-100">
      <div className="min-w-75 text-black/70 bg-blue-subtle p-3 rounded-md text-left relative">
        {message}
        <span className="size-4 rotate-45 bg-blue-subtle z-100 absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2" />
      </div>
    </div>
  );
};
