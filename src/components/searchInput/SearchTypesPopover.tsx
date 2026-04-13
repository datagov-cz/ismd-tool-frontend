import { useEffect, useRef, useState } from 'react';
import { GovButton, GovIcon, GovTooltip } from '@gov-design-system-ce/react';
import clsx from 'clsx';

type SearchType = 'Pojem' | 'Diagram' | 'Slovník' | 'Rozpracovaný';

type SearchTypeConfig = {
  label: SearchType;
  icon: string;
  iconType: string;
  color: 'primary' | 'secondary' | 'success' | 'neutral';
};

const SEARCH_TYPES: SearchTypeConfig[] = [
  {
    label: 'Pojem',
    icon: 'card-heading',
    iconType: 'components',
    color: 'primary',
  },
  {
    label: 'Diagram',
    icon: 'diagram-3',
    iconType: 'components',
    color: 'neutral',
  },
  {
    label: 'Slovník',
    icon: 'journal-text',
    iconType: 'components',
    color: 'success',
  },
  {
    label: 'Rozpracovaný',
    icon: 'journals',
    iconType: 'components',
    color: 'secondary',
  },
];

export const SearchTypesPopover = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SearchType[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggleType = (type: SearchType) => {
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const label =
    selected.length === 0 || selected.length === SEARCH_TYPES.length ? (
      'Všechny typy'
    ) : (
      <span className="flex items-center gap-2">
        Vybrané:
        {SEARCH_TYPES.filter((i) => selected.includes(i.label)).map((t) => (
          <GovTooltip
            key={t.label}
            position="top"
            className="border-0! mt-1"
            message={t.label}
          >
            <GovIcon type={t.iconType} name={t.icon} color={t.color} size="s" />
          </GovTooltip>
        ))}
      </span>
    );

  return (
    <div
      ref={containerRef}
      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center z-1000"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gov-color-secondary-700 hover:bg-gov-color-secondary-100 transition-colors"
      >
        <GovIcon
          type="components"
          name="chevron-down"
          slot="icon-start"
          size="xs"
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
        {label}
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          aria-label="Typ vyhledávání"
          className="absolute right-0 top-full mt-1 z-50 flex flex-col rounded-lg border border-dark-primary/10 bg-white shadow-lg min-w-max overflow-hidden"
        >
          {SEARCH_TYPES.map(({ label: type, icon, iconType, color }) => {
            const isSelected = selected.includes(type);
            return (
              <GovButton
                key={type}
                type="base"
                role="option"
                aria-selected={isSelected}
                onGovClick={() => toggleType(type)}
                color="primary"
                className={clsx(
                  'w-full px-3 py-2 text-sm [&_button]:justify-start! [&_button]:text-black! rounded-none! ',
                  isSelected && 'bg-blue-outlined-hover!',
                )}
                expanded
              >
                <GovIcon
                  type={iconType}
                  color={color}
                  name={icon}
                  size="s"
                  slot="icon-start"
                />
                <span className="font-normal">{type}</span>
              </GovButton>
            );
          })}
        </div>
      )}
    </div>
  );
};
