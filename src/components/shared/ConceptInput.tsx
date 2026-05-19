import { useEffect, useRef, useState } from 'react';
import {
  GovFormInput,
  GovFormLabel,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useFormContext } from 'react-hook-form';

import { useSearch } from '@/api/generated';
import { RelatedTerm } from '../conceptDetail/RelatedTerm';

interface Concept {
  iri: string;
  label: string;
}

interface Props {
  label: string;
  placeholder: string;
  name: string;
  single?: boolean;
}

export const ConceptInput = ({ label, placeholder, name, single }: Props) => {
  const [query, setQuery] = useState('');
  const [showInput, setShowInput] = useState(true);
  const [selected, setSelected] = useState<Concept[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: search, isLoading } = useSearch(
    { q: query, type: 'CONCEPT' },
    { query: { enabled: query.length > 3 } },
  );

  const { setValue } = useFormContext();

  useEffect(() => {
    if (single) {
      setValue(name, selected[0]?.iri ?? '');
    } else {
      setValue(
        name,
        selected.map((s) => s.iri),
      );
    }
  }, [selected, name, setValue, single]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (item: Concept) => {
    if (single) {
      setSelected([item]);
    } else if (!selected.find((s) => s.iri === item.iri)) {
      setSelected((prev) => [...prev, item]);
    }
    setQuery('');
    setShowInput(false);
  };

  const handleRemove = (id: string) => {
    const next = selected.filter((s) => s.iri !== id);
    setSelected(next);
    if (next.length === 0) setShowInput(true);
  };

  const results = search?.data?.results ?? [];
  const showDropdown =
    query.length > 3 &&
    (isLoading || results.length > 0 || search !== undefined);

  return (
    <div className="w-full space-y-2">
      <div className="w-full grid grid-cols-7 gap-y-4 gap-x-2">
        <GovFormLabel className="w-fit! pt-2.5">
          <span className="font-bold">{label}</span>
        </GovFormLabel>

        <div className="col-span-6 flex flex-col gap-2 ml-10">
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((concept) => (
                <RelatedTerm
                  label={concept.label}
                  key={concept.iri}
                  remove={() => handleRemove(concept.iri)}
                />
              ))}
            </div>
          )}

          {showInput ? (
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
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-4 text-gray-500 text-sm gap-2">
                      <GovIcon
                        name="loader"
                        type="components"
                        size="s"
                        className="animate-spin"
                      />
                      Načítání...
                    </div>
                  ) : results.length === 0 ? (
                    <div className="p-4 text-gray-500 text-sm text-center">
                      Pro tohle nemáme žádné výsledky
                    </div>
                  ) : (
                    results.map((item) => (
                      <button
                        key={item.slug}
                        type="button"
                        onClick={() =>
                          handleSelect({
                            iri: item.iri || '',
                            label: item.label || '',
                          })
                        }
                        className="border-b border-border-subtlest text-blue-primary hover:bg-primary-subtlest w-full gap-1.5 flex font-bold p-2"
                      >
                        <GovIcon
                          slot="icon-start"
                          name="card-heading"
                          type="components"
                          size="l"
                          color="primary"
                          className="mt-0.5! shrink-0"
                        />
                        {item.label}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="self-start text-sm text-blue-primary hover:underline cursor-pointer font-medium flex items-center gap-1"
            >
              + Přidat další pojem
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
