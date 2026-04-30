import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';

import { ConceptDetailModel } from '@/api/generated';

export type TermProps = {
  data: ConceptDetailModel;
  subterms?: { data: ConceptDetailModel; slug: string }[];
  tree?: boolean;
  slug?: string;
};

type SubtermRowProps = {
  item: { data: ConceptDetailModel; slug: string };
  isLast: boolean;
};

const SubtermRow = ({ item, isLast }: SubtermRowProps) => {
  const name = item.data.název?.cs;

  return (
    <div className="relative flex items-start pl-4">
      <span
        className={`absolute left-0 top-0 w-px bg-blue-primary/30 ${isLast ? 'h-3.5' : 'h-full'}`}
      />
      <span className="absolute left-0 top-3.5 w-2 h-px bg-blue-primary/30" />

      <a
        href={`${process.env.NEXT_PUBLIC_BASE_PATH}/concept/${item.slug}`}
        className="text-blue-button-active font-bold hover:underline leading-snug py-0.5"
      >
        {name}
        {item.data.definice?.cs && (
          <p className="text-card-description font-normal text-sm text-gray-600 mt-0.5">
            {item.data.definice.cs}
          </p>
        )}
      </a>
    </div>
  );
};

type SubtermGroupProps = {
  label: string;
  items: { data: ConceptDetailModel; slug: string }[];
  isLast?: boolean;
};

const SubtermGroup = ({ label, items, isLast }: SubtermGroupProps) => {
  if (items.length === 0) return null;

  return (
    <div className="relative pl-6.5">
      <span
        className={clsx(
          `absolute left-2.5 w-px bg-blue-primary/30`,
          isLast ? 'top-0 h-2.5' : 'top-0 bottom-0',
        )}
      />

      <p className="text-sm text-black font-medium mb-1.5 relative">
        <span className="absolute -left-4 top-1/2 w-2 h-px bg-blue-primary/30" />
        {label}
      </p>

      <div className="flex flex-col">
        {items.map((item, index) => (
          <SubtermRow
            key={item.data.iri || index}
            item={item}
            isLast={index === items.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export const Term = ({ data, subterms, slug }: TermProps) => {
  const name = data.název?.cs;
  const capitalizedName = name && name.charAt(0).toUpperCase() + name.slice(1);

  const properties =
    subterms?.filter((item) => item.data.typ?.includes('Vlastnost')) ?? [];
  const relations =
    subterms?.filter((item) => item.data.typ?.includes('Vztah')) ?? [];

  const visibleGroups = [
    { label: 'Vlastnosti', items: properties },
    { label: 'Vztahy', items: relations },
  ].filter((g) => g.items.length > 0);

  const hasSubterms = visibleGroups.length > 0;

  return (
    <a
      href={`${process.env.NEXT_PUBLIC_BASE_PATH}/concept/${slug}`}
      className="bg-white rounded-xl px-3 py-2 border border-border-grey overflow-hidden shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] flex flex-col"
    >
      <span className={clsx('relative flex gap-2', hasSubterms && 'pb-3')}>
        <GovIcon
          slot="icon-start"
          name="card-heading"
          type="components"
          size="l"
          color="primary"
          className="mt-0.5! shrink-0"
        />
        <span>
          <span className="text-blue-button-active font-bold">
            {capitalizedName}
          </span>
          {data.definice?.cs && (
            <p className="text-card-description text-sm mt-0.5">
              {data.definice.cs}
            </p>
          )}
        </span>

        {hasSubterms && (
          <span className="absolute left-2.5 top-6 bottom-0 w-px bg-blue-primary/30" />
        )}
      </span>

      {hasSubterms && (
        <div className="flex flex-col">
          {visibleGroups.map((group, index) => (
            <SubtermGroup
              key={group.label}
              label={group.label}
              items={group.items}
              isLast={index === visibleGroups.length - 1}
            />
          ))}
        </div>
      )}
    </a>
  );
};
