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

export type SearchType = 'Pojem' | 'Diagram' | 'Slovník' | 'Rozpracovaný';

type SearchTypeConfig = {
  key: SearchType;
  icon: string;
  iconType: string;
  color: 'primary' | 'secondary' | 'success' | 'neutral';
};

const SEARCH_TYPES: SearchTypeConfig[] = [
  {
    key: 'Pojem',
    icon: 'card-heading',
    iconType: 'components',
    color: 'primary',
  },
  {
    key: 'Diagram',
    icon: 'diagram-3',
    iconType: 'components',
    color: 'neutral',
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

export const SearchTypesPopover = () => {
  const t = useTranslations('SearchTypes');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SearchType[]>([]);

  const toggleType = (type: SearchType) => {
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((s) => s !== type) : [...prev, type],
    );
  };

  const allOrNone =
    selected.length === 0 || selected.length === SEARCH_TYPES.length;

  return (
    <GovDropdown
      id="search-type-dropdown"
      position="left"
      onChange={() => setOpen((prev) => !prev)}
      className="absolute! top-1/2! right-0! -translate-y-1/2!"
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
            {SEARCH_TYPES.filter((i) => selected.includes(i.key)).map(
              (type) => (
                <GovTooltip
                  key={type.key}
                  position="bottom"
                  className="border-0! mt-1"
                  message={t(`Types.${type.key}`)}
                >
                  <GovIcon
                    type={type.iconType}
                    name={type.icon}
                    color={type.color}
                    size="s"
                  />
                </GovTooltip>
              ),
            )}
          </span>
        )}
      </GovButton>

      <ul slot="list" className="p-0!">
        {SEARCH_TYPES.map(({ key, icon, iconType, color }) => {
          const isSelected = selected.includes(key);
          return (
            <li key={key}>
              <GovButton
                type="base"
                color="neutral"
                expanded
                onGovClick={() => toggleType(key)}
                className={clsx(
                  '[&_button]:justify-start! [&_button]:text-black! rounded-none!',
                  isSelected && 'bg-blue-outlined-hover!',
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
          );
        })}
      </ul>
    </GovDropdown>
  );
};
