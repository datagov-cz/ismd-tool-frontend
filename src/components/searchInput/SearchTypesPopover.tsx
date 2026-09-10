'use client';

import { useState } from 'react';
import {
  GovButton,
  GovDropdown,
  GovIcon,
  GovTooltip,
  GovTooltipContent,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { SearchSource, SearchType as ApiSearchType } from '@/api/generated';
import { useCurrentUser } from '../contexts/CurrentUserProvider';

export type SearchFilter = 'Pojem' | 'Slovník' | 'Diagram' | 'Rozpracovaný';

type SearchFilterConfig = {
  key: SearchFilter;
  icon: string;
  iconType: string;
  color: 'primary' | 'secondary' | 'success' | 'neutral' | undefined;
  iconClassName?: string;
};

export const SEARCH_FILTERS: SearchFilterConfig[] = [
  {
    key: 'Pojem',
    icon: 'card-heading',
    iconType: 'components',
    color: 'primary',
  },
  {
    key: 'Slovník',
    icon: 'journal-text',
    iconType: 'components',
    color: 'success',
  },
  {
    key: 'Diagram',
    icon: 'diagram-3',
    iconType: 'components',
    color: undefined,
    iconClassName: 'text-purple!',
  },
  {
    key: 'Rozpracovaný',
    icon: 'journals',
    iconType: 'components',
    color: 'secondary',
  },
];

const SEARCH_TYPE_FILTERS: SearchFilter[] = ['Pojem', 'Slovník', 'Diagram'];

export function filterToApiParams(filters: SearchFilter[]): {
  type?: ApiSearchType;
  source?: SearchSource;
} {
  const hasConcept = filters.includes('Pojem');
  const hasOntology = filters.includes('Slovník');
  const hasDiagram = filters.includes('Diagram');
  const hasUnpublished = filters.includes('Rozpracovaný');
  const selectedTypes = [hasConcept, hasOntology, hasDiagram].filter(Boolean);

  return {
    type:
      selectedTypes.length !== 1
        ? undefined
        : hasConcept
          ? ApiSearchType.CONCEPT
          : hasOntology
            ? ApiSearchType.ONTOLOGY
            : ApiSearchType.DIAGRAM,
    source: hasUnpublished ? SearchSource.UNPUBLISHED : undefined,
  };
}

type Props = {
  value: SearchFilter[];
  onChange: (_value: SearchFilter[]) => void;
  offsetClassName?: string;
};

export const SearchTypesPopover = ({
  value,
  onChange,
  offsetClassName = 'right-0!',
}: Props) => {
  const t = useTranslations('SearchTypes');
  const [open, setOpen] = useState(false);
  const { user } = useCurrentUser();

  const isLoggedIn = !!user?.userId;
  const visibleFilters = SEARCH_FILTERS.filter(
    (f) => f.key !== 'Rozpracovaný' || isLoggedIn,
  );

  const toggle = (filter: SearchFilter) => {
    if (filter === 'Rozpracovaný') {
      onChange(
        value.includes(filter)
          ? value.filter((item) => item !== filter)
          : [...value, filter],
      );
      return;
    }

    const sourceFilters = value.filter(
      (item) => !SEARCH_TYPE_FILTERS.includes(item),
    );
    onChange(
      value.includes(filter) ? sourceFilters : [...sourceFilters, filter],
    );
  };

  const selectedTypeCount = value.filter((filter) =>
    SEARCH_TYPE_FILTERS.includes(filter),
  ).length;
  const allOrNone = selectedTypeCount === 0 && !value.includes('Rozpracovaný');

  return (
    <GovDropdown
      id="search-type-dropdown"
      position="right"
      onChange={() => setOpen((prev) => !prev)}
      className={clsx(
        'absolute! top-1/2! -translate-y-1/2! z-100',
        offsetClassName,
      )}
    >
      <GovButton
        type="base"
        color="neutral"
        size="s"
        className="no-underline hover:bg-transparent! font-normal"
      >
        <GovIcon
          type="components"
          name="chevron-down"
          slot="icon-start"
          size="xs"
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
        {allOrNone ? (
          <span className="font-normal text-xs lg:text-sm">
            {t('AllTypes')}
          </span>
        ) : (
          <span className="flex items-center gap-2 font-normal bg-white">
            <span className="text-xs lg:text-sm"> {t('Selected')}</span>
            {visibleFilters
              .filter((f) => value.includes(f.key))
              .map((f) => (
                <GovTooltip
                  key={f.key}
                  position="right"
                  className="border-0! mt-1"
                  message={t(`Types.${f.key}`)}
                >
                  <GovTooltipContent className="z-1000!">
                    {t(`Types.${f.key}`)}
                  </GovTooltipContent>
                  <GovIcon
                    type={f.iconType}
                    name={f.icon}
                    color={f.color}
                    size="s"
                    className={f.iconClassName}
                  />
                </GovTooltip>
              ))}
          </span>
        )}
      </GovButton>

      <ul className="p-0!" slot="list">
        {visibleFilters.map(({ key, icon, iconType, color, iconClassName }) => (
          <li key={key}>
            <GovButton
              type="base"
              color="neutral"
              expanded
              onGovClick={() => toggle(key)}
              className={clsx(
                '[&_button]:justify-start! [&_button]:text-black! rounded-none!',
                value.includes(key) && 'bg-blue-outlined-hover!',
              )}
            >
              <GovIcon
                type={iconType}
                color={color}
                name={icon}
                size="s"
                slot="icon-start"
                className={iconClassName}
              />
              <span className="font-normal">{t(`Types.${key}`)}</span>
            </GovButton>
          </li>
        ))}
      </ul>
    </GovDropdown>
  );
};
