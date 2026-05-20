'use client';

import { useState } from 'react';
import {
  GovButton,
  GovDropdown,
  GovIcon,
  GovTooltip,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { SearchSource, SearchType as ApiSearchType } from '@/api/generated';

export type SearchFilter = 'Pojem' | 'Slovník' | 'Rozpracovaný';

type SearchFilterConfig = {
  key: SearchFilter;
  icon: string;
  iconType: string;
  color: 'primary' | 'secondary' | 'success' | 'neutral';
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
    key: 'Rozpracovaný',
    icon: 'journals',
    iconType: 'components',
    color: 'secondary',
  },
];

export function filterToApiParams(filters: SearchFilter[]): {
  type?: ApiSearchType;
  source?: SearchSource;
} {
  const hasConcept = filters.includes('Pojem');
  const hasOntology = filters.includes('Slovník');
  const hasUnpublished = filters.includes('Rozpracovaný');
  const allOrNone =
    filters.length === 0 || filters.length === SEARCH_FILTERS.length;

  return {
    type: allOrNone
      ? undefined
      : hasConcept && !hasOntology
        ? ApiSearchType.CONCEPT
        : !hasConcept && hasOntology
          ? ApiSearchType.ONTOLOGY
          : undefined,
    source: hasUnpublished ? SearchSource.UNPUBLISHED : undefined,
  };
}

type Props = {
  value: SearchFilter[];
  onChange: (_value: SearchFilter[]) => void;
};

export const SearchTypesPopover = ({ value, onChange }: Props) => {
  const t = useTranslations('SearchTypes');
  const [open, setOpen] = useState(false);

  const toggle = (filter: SearchFilter) =>
    onChange(
      value.includes(filter)
        ? value.filter((f) => f !== filter)
        : [...value, filter],
    );

  const allOrNone =
    value.length === 0 || value.length === SEARCH_FILTERS.length;

  return (
    <GovDropdown
      id="search-type-dropdown"
      position="left"
      onChange={() => setOpen((prev) => !prev)}
      className="absolute! top-1/2! right-0! -translate-y-1/2! z-100"
    >
      <GovButton
        type="base"
        color="neutral"
        size="s"
        className="no-underline hover:bg-transparent! font-normal!"
      >
        <GovIcon
          type="components"
          name="chevron-down"
          slot="icon-start"
          size="xs"
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
        {allOrNone ? (
          <span className="font-normal">{t('AllTypes')}</span>
        ) : (
          <span className="flex items-center gap-2 font-normal">
            {t('Selected')}
            {SEARCH_FILTERS.filter((f) => value.includes(f.key)).map((f) => (
              <GovTooltip
                key={f.key}
                position="bottom"
                className="border-0! mt-1"
                message={t(`Types.${f.key}`)}
              >
                <GovIcon
                  type={f.iconType}
                  name={f.icon}
                  color={f.color}
                  size="s"
                />
              </GovTooltip>
            ))}
          </span>
        )}
      </GovButton>

      <ul className="p-0!" slot="list">
        {SEARCH_FILTERS.map(({ key, icon, iconType, color }) => (
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
              />
              <span className="font-normal">{t(`Types.${key}`)}</span>
            </GovButton>
          </li>
        ))}
      </ul>
    </GovDropdown>
  );
};
