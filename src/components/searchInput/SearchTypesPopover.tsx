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
import { useCurrentUser } from '../contexts/CurrentUserProvider';

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
      position="right"
      onChange={() => setOpen((prev) => !prev)}
      type="base"
      color="neutral"
      size="s"
      className={clsx(
        'absolute! top-1/2! -translate-y-1/2! z-100',
        '[&>.gov-button]:no-underline [&>.gov-button]:font-normal [&>.gov-button_button:hover]:bg-transparent!',
        offsetClassName,
      )}
      label={
        <>
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
            <span className="flex items-center gap-2 font-normal bg-surface">
              <span className="text-xs lg:text-sm"> {t('Selected')}</span>
              {visibleFilters
                .filter((f) => value.includes(f.key))
                .map((f) => (
                  <GovTooltip key={f.key} placement="right">
                    <GovTooltip.Trigger asChild>
                      <GovIcon
                        type={f.iconType}
                        name={f.icon}
                        color={f.color}
                        size="s"
                      />
                    </GovTooltip.Trigger>
                    <GovTooltip.Content className="z-1000!">
                      {t(`Types.${f.key}`)}
                    </GovTooltip.Content>
                  </GovTooltip>
                ))}
            </span>
          )}
        </>
      }
    >
      {visibleFilters.map(({ key, icon, iconType, color }) => (
        <GovButton
          key={key}
          type="base"
          color="neutral"
          expanded
          onClick={() => toggle(key)}
          className={clsx(
            '[&_button]:justify-start! [&_button]:text-foreground! rounded-none!',
            value.includes(key) && 'bg-blue-outlined-hover!',
          )}
          iconStart={
            <GovIcon type={iconType} color={color} name={icon} size="s" />
          }
        >
          <span className="font-normal">{t(`Types.${key}`)}</span>
        </GovButton>
      ))}
    </GovDropdown>
  );
};
