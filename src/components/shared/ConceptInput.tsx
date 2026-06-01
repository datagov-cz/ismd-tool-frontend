import { useEffect, useRef, useState } from 'react';
import {
  GovFormInput,
  GovFormLabel,
  GovIcon,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';

import {
  SearchResultDto,
  SearchSource,
  SearchType,
  useSearch,
} from '@/api/generated';
import { RelatedTerm } from '../conceptDetail/Term/RelatedTerm';

const LIMIT = 20;

interface Concept {
  iri: string;
  label: string;
  ontologyLabel?: string;
  id?: number;
}

interface Props {
  label?: string;
  placeholder: string;
  name: string;
  single?: boolean;
  nonFloatingDropDown?: boolean;
  searchType: SearchType;
  searchSource: SearchSource;
}

export const ConceptInput = ({
  label,
  placeholder,
  name,
  single,
  nonFloatingDropDown,
  searchType,
  searchSource,
}: Props) => {
  const [query, setQuery] = useState('');
  const [showInput, setShowInput] = useState(true);
  const [offset, setOffset] = useState(0);
  const [allResults, setAllResults] = useState<SearchResultDto[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('ConceptDetail.Main');

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

  useEffect(() => {
    setOffset(0);
    setAllResults([]);
  }, [query]);

  const { data: search, isFetching } = useSearch(
    { q: query, type: searchType, source: searchSource, offset, limit: LIMIT },
    { query: { enabled: query.length > 3 } },
  );

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
        {label && (
          <GovFormLabel className="w-fit! pt-2.5">
            <span className="font-bold">{label}</span>
          </GovFormLabel>
        )}

        <div
          className={clsx(
            'flex flex-col gap-2',
            label ? 'col-span-6 ml-10' : 'col-span-7',
          )}
        >
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((concept) => (
                <RelatedTerm
                  label={concept.label}
                  key={concept.iri}
                  remove={() => handleRemove(concept.iri)}
                  ontologyLabel={concept.ontologyLabel}
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
                <div
                  className={clsx(
                    'z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto',
                    nonFloatingDropDown ? 'relative' : 'absolute',
                  )}
                >
                  {isFetching && allResults.length === 0 ? (
                    <div className="flex items-center justify-center p-4 text-gray-500 text-sm gap-2">
                      <GovIcon
                        name="loader"
                        type="components"
                        size="s"
                        className="animate-spin"
                      />
                      {t('Loading')}
                    </div>
                  ) : allResults.length === 0 ? (
                    <div className="p-4 text-gray-500 text-sm text-center">
                      {t('NoResults')}
                    </div>
                  ) : (
                    <>
                      {allResults.map((item) => (
                        <button
                          key={item.slug}
                          type="button"
                          onClick={() => {
                            console.log('Selected item:', item);
                            handleSelect({
                              iri: item.iri || '',
                              label: item.label || '',
                              id: item.id,
                            });
                          }}
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
                            {item.ontologyIri
                              ?.split('/')
                              .pop()
                              ?.replace(/---/g, '\x00')
                              .replace(/-/g, ' ')
                              .replace(/\x00/g, ' - ')
                              .normalize('NFD')
                              .replace(/[\u0300-\u036f]/g, '')
                              .normalize('NFC') || ''}
                          </span>
                        </button>
                      ))}

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
            selected.length > 0 &&
            !single && (
              <button
                type="button"
                onClick={() => setShowInput(true)}
                className="self-start text-sm text-blue-primary hover:underline cursor-pointer font-medium flex items-center gap-1"
              >
                {t('AddConcept')}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
