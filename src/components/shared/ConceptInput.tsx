import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  GovFormInput,
  GovFormLabel,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';

import {
  search as searchRequest,
  SearchResultDto,
  SearchSource,
  SearchType,
} from '@/api/generated';
import { useActiveAnchor } from '@/hooks/useActiveAnchor';
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
  anchor?: string;
  layout?: 'grid' | 'flex';
}

export const ConceptInput = ({
  label,
  placeholder,
  name,
  single,
  nonFloatingDropDown,
  searchType,
  searchSource,
  anchor,
  layout = 'grid',
}: Props) => {
  const [query, setQuery] = useState('');
  const [showInput, setShowInput] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const t = useTranslations('ConceptDetail.Main');

  const isActive = useActiveAnchor(anchor);

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

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['concept-input-search', query, searchType, searchSource],
    queryFn: ({ pageParam }) =>
      searchRequest({
        q: query,
        type: searchType,
        source: searchSource,
        offset: pageParam,
        limit: LIMIT,
      }),
    initialPageParam: 0,
    enabled: query.length > 3,
    getNextPageParam: (lastPage, allPages) => {
      const lastCount = lastPage.data?.results?.length ?? 0;
      if (lastCount < LIMIT) return undefined;

      return allPages.reduce(
        (sum, page) => sum + (page.data?.results?.length ?? 0),
        0,
      );
    },
  });

  const allResults = useMemo<SearchResultDto[]>(
    () => data?.pages.flatMap((page) => page.data?.results ?? []) ?? [],
    [data],
  );

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isFetchingNextPage && hasNextPage) {
            fetchNextPage();
          }
        },
        { root: scrollContainerRef.current, threshold: 0.1 },
      );
      observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

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
      setValue(name, null, { shouldDirty: true });
      setShowInput(true);
    } else {
      const next = selected.filter((s) => s.iri !== iri);
      setValue(name, next, { shouldDirty: true });
      if (next.length === 0) setShowInput(true);
    }
  };

  const showDropdown =
    query.length > 3 && (isFetching || allResults.length > 0);

  return (
    <div
      className={clsx(
        'w-full space-y-2 p-2.5 rounded-lg',
        isActive && 'bg-blue-subtle',
      )}
      id={anchor}
    >
      <div
        className={clsx(
          'w-full',
          layout === 'grid'
            ? 'grid grid-cols-7 gap-y-4 gap-x-2'
            : 'flex flex-col',
        )}
      >
        {label && (
          <GovFormLabel className="w-fit! pt-2.5">
            <span className="font-bold">{label}</span>
          </GovFormLabel>
        )}

        <div
          className={clsx(
            'flex flex-col gap-2',
            label ? 'col-span-6' : 'col-span-7',
            layout === 'grid' && 'ml-10',
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
                  ref={scrollContainerRef}
                  className={clsx(
                    'z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto',
                    nonFloatingDropDown ? 'relative' : 'absolute',
                  )}
                >
                  {isLoading ? (
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
                          key={item.iri}
                          type="button"
                          onClick={() => {
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
                              name={
                                item.conceptType === 'VLASTNOST'
                                  ? 'tag'
                                  : item.conceptType === 'VZTAH'
                                    ? 'bezier2'
                                    : 'card-heading'
                              }
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
                        {isFetchingNextPage && (
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
