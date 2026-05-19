import { useEffect, useRef, useState } from 'react';
import {
  GovFormInput,
  GovFormLabel,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useFormContext } from 'react-hook-form';

import {
  RppSearchResultDto,
  useSearchAgendas,
  useSearchIsvs,
} from '@/api/generated';
import { RelatedTerm } from '../conceptDetail/RelatedTerm';

interface Props {
  label: string;
  placeholder: string;
  name: string;
  type: 'AIS' | 'AGENDA';
}

export const RPPInput = ({ label, placeholder, name, type }: Props) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<RppSearchResultDto>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setValue } = useFormContext();

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
    setValue(name, selected?.iri);
  }, [selected, name, setValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setQuery('');
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: RppSearchResultDto) => {
    setSelected(item);
    setQuery('');
  };

  return (
    <div className="w-full space-y-2">
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
                    {item.nazev}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selected && (
            <div className="flex flex-wrap gap-2 pt-1">
              <RelatedTerm
                noIcon
                label={selected.nazev ?? ''}
                href=""
                remove={() => setSelected(undefined)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
