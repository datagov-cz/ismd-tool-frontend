import { useEffect, useRef, useState } from 'react';
import {
  GovFormInput,
  GovFormLabel,
  GovIcon,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useFormContext, useWatch } from 'react-hook-form'; // 👈 add useWatch

import {
  RppSearchResultDto,
  useSearchAgendas,
  useSearchIsvs,
} from '@/api/generated';
import { useActiveAnchor } from '@/hooks/useActiveAnchor';
import { RelatedTerm } from '../conceptDetail/Term/RelatedTerm';

interface Props {
  label: string;
  placeholder: string;
  name: string;
  type: 'AIS' | 'AGENDA';
}

export const RPPInput = ({ label, placeholder, name, type }: Props) => {
  const [query, setQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setValue } = useFormContext();

  const selected: RppSearchResultDto | undefined = useWatch({ name });
  const isActive = useActiveAnchor(name);

  const enabled = query.length > 1;

  const { data: agenda } = useSearchAgendas(
    { q: query },
    { query: { enabled: enabled && type === 'AGENDA' } },
  );
  const { data: ais } = useSearchIsvs(
    { q: query },
    { query: { enabled: enabled && type === 'AIS' } },
  );

  const results = agenda?.data ?? ais?.data;
  const showDropdown = enabled && (results?.length ?? 0) > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setQuery('');
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: RppSearchResultDto) => {
    setValue(name, { ...item, label: item.nazev }, { shouldDirty: true });
    setQuery('');
  };

  return (
    <div
      className={clsx(
        'w-full space-y-2 p-2.5 rounded-lg',
        isActive && 'bg-blue-subtle',
      )}
      id={name}
    >
      <div className="w-full grid grid-cols-7 gap-x-2 gap-y-4">
        <GovFormLabel className="w-fit! pt-2.5">
          <span className="font-bold">{label}</span>
        </GovFormLabel>

        <div className="col-span-6 ml-10 flex flex-col gap-2">
          <div className="relative" ref={dropdownRef}>
            <GovFormInput
              placeholder={placeholder}
              value={query}
              onGovInput={(e) => setQuery(e.detail.value)}
              className="border-0! flex-1"
              inputType="text"
            >
              <GovIcon
                name="search"
                slot="icon-end"
                type="components"
                size="s"
              />
            </GovFormInput>

            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                {results?.map((item) => (
                  <button
                    key={item.iri}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="flex w-full gap-1.5 border-b border-border-subtlest p-2 font-bold text-blue-primary hover:bg-primary-subtlest"
                  >
                    {item.code} - {item.nazev}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selected && (
            <div className="flex flex-wrap gap-2 pt-1">
              <RelatedTerm
                noIcon
                label={`${selected.code} - ${selected.nazev}`}
                href=""
                remove={() => setValue(name, undefined, { shouldDirty: true })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
