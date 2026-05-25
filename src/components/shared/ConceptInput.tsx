import { useEffect, useRef, useState } from 'react';
import {
  GovFormInput,
  GovFormLabel,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useFormContext, useWatch } from 'react-hook-form';

import { SearchResultDto, useSearch } from '@/api/generated';
import { RelatedTerm } from '../conceptDetail/Term/RelatedTerm';

const LIMIT = 20;

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
  const [offset, setOffset] = useState(0);
  const [allResults, setAllResults] = useState<SearchResultDto[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { setValue } = useFormContext();

  const rawValue = useWatch({ name });
  const selected: Concept[] = single
    ? rawValue
      ? [rawValue]
      : []
    : Array.isArray(rawValue)
      ? rawValue
      : [];

  useEffect(() => {
    if (single && selected.length > 0) {
      setShowInput(false);
    } else if (!single && selected.length === 0) {
      setShowInput(true);
    }
  }, [selected.length, single]);

  // Reset pagination whenever the query changes
  useEffect(() => {
    setOffset(0);
    setAllResults([]);
  }, [query]);

  const { data: search, isFetching } = useSearch(
    { q: query, type: 'CONCEPT', offset, limit: LIMIT },
    { query: { enabled: query.length > 3 } },
  );

  // Accumulate pages
  useEffect(() => {
    if (search?.data?.results && !isFetching) {
      setAllResults((prev) =>
        offset === 0
          ? (search.data?.results ?? [])
          : [...prev, ...(search.data?.results ?? [])],
      );
    }
  }, [isFetching, search, offset]);

  const totalCount = search?.data?.totalConcepts ?? 0;
  const hasMore = totalCount > allResults.length;

  // Infinite scroll sentinel inside the dropdown
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && hasMore) {
          setOffset((prev) => prev + LIMIT);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isFetching, hasMore]);

  // Close dropdown on outside click
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
      setValue(name, item, { shouldDirty: true });
    } else {
      const next = selected.some((s) => s.iri === item.iri)
        ? selected
        : [...selected, item];
      setValue(name, next, { shouldDirty: true });
    }
    setQuery('');
    setShowInput(false);
  };

  const handleRemove = (iri: string) => {
    if (single) {
      setValue(name, undefined, { shouldDirty: true });
      setShowInput(true);
    } else {
      const next = selected.filter((s) => s.iri !== iri);
      setValue(name, next, { shouldDirty: true });
      if (next.length === 0) setShowInput(true);
    }
  };

  const showDropdown =
    query.length > 3 &&
    (isFetching || allResults.length > 0 || search !== undefined);

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
                  {isFetching && allResults.length === 0 ? (
                    <div className="flex items-center justify-center p-4 text-gray-500 text-sm gap-2">
                      <GovIcon
                        name="loader"
                        type="components"
                        size="s"
                        className="animate-spin"
                      />
                      Načítání...
                    </div>
                  ) : allResults.length === 0 ? (
                    <div className="p-4 text-gray-500 text-sm text-center">
                      Pro tohle nemáme žádné výsledky
                    </div>
                  ) : (
                    <>
                      {allResults.map((item) => (
                        <button
                          key={item.slug}
                          type="button"
                          onClick={() =>
                            handleSelect({
                              iri: item.iri || '',
                              label: item.label || '',
                            })
                          }
                          className="border-b border-border-subtlest text-blue-primary hover:bg-primary-subtlest text-left w-full gap-1.5 flex flex-col font-bold p-2"
                        >
                          <span className="flex gap-1.5">
                            <GovIcon
                              slot="icon-start"
                              name="card-heading"
                              type="components"
                              size="l"
                              color="primary"
                              className="mt-0.5! shrink-0"
                            />
                            {item.label}
                          </span>

                          <span className="flex gap-1 items-center pl-4 font-normal text-dark-primary/70">
                            <GovIcon
                              slot="icon-start"
                              name="journals"
                              type="components"
                              size="s"
                              color="success"
                              className="mt-0.5! shrink-0"
                            />
                            {item.ontologyIri}
                          </span>
                        </button>
                      ))}

                      {/* Infinite scroll sentinel */}
                      <div
                        ref={sentinelRef}
                        className="py-2 flex justify-center"
                      >
                        {isFetching && (
                          <GovIcon
                            name="loader"
                            type="components"
                            size="s"
                            className="animate-spin"
                          />
                        )}
                      </div>
                    </>
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
