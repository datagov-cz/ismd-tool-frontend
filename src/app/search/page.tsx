'use client';

import { useEffect, useMemo, useRef } from 'react';
import { GovButton } from '@gov-design-system-ce/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  search,
  SearchResultDto,
  SearchSource,
  SearchType as ApiSearchType,
} from '@/api/generated';
import { useCurrentUser } from '@/components/contexts/CurrentUserProvider';
import { CircularLoader } from '@/components/shared/CircularLoader';
import { ConceptCard } from '@/components/shared/ConceptCard/ConceptCard';
import { DictionaryCard } from '@/components/shared/DictionaryCard/DictionaryCard';

const LIMIT = 20;

const isApiSearchType = (v: string | null): v is ApiSearchType =>
  Object.values(ApiSearchType).includes(v as ApiSearchType);

const isSearchSource = (v: string | null): v is SearchSource =>
  Object.values(SearchSource).includes(v as SearchSource);

const Search = () => {
  const t = useTranslations('Search');
  const tTypes = useTranslations('SearchTypes');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';

  const rawType = searchParams.get('type');
  const activeType = isApiSearchType(rawType) ? rawType : undefined;

  const rawSource = searchParams.get('source');
  const activeSource = isSearchSource(rawSource) ? rawSource : undefined;

  const { user } = useCurrentUser();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ['search', q, activeType, activeSource],
      queryFn: ({ pageParam }) =>
        search({
          q,
          type: activeType,
          source: activeSource,
          offset: pageParam,
          limit: LIMIT,
        }),
      initialPageParam: 0,
      enabled: q.trim().length > 1,
      getNextPageParam: (lastPage, allPages) => {
        const lastCount = lastPage.data?.results?.length ?? 0;

        if (lastCount < LIMIT) return undefined;

        const loaded = allPages.reduce(
          (sum, page) => sum + (page.data?.results?.length ?? 0),
          0,
        );
        return loaded;
      },
    });

  const results = useMemo<SearchResultDto[]>(
    () =>
      data?.pages.flatMap((page) =>
        page.success ? (page.data?.results ?? []) : [],
      ) ?? [],
    [data],
  );

  const firstPage = data?.pages[0]?.data;

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  const toggleType = (type: ApiSearchType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeType === type) {
      params.delete('type');
    } else {
      params.set('type', type);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleSource = (source: SearchSource) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeSource === source) {
      params.delete('source');
    } else {
      params.set('source', source);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full py-10 px-5">
      <div className="max-w-250 mx-auto space-y-3">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-center text-xl font-medium">
            {t('SearchesFor')} &#39;{q}&#39;
          </h1>

          <div className="flex gap-2">
            <span className="font-bold text-sm">{t('FilterLabel')} </span>
            <GovButton
              type={
                activeType === ApiSearchType.ONTOLOGY ? 'solid' : 'outlined'
              }
              onGovClick={() => toggleType(ApiSearchType.ONTOLOGY)}
              color="success"
              size="xs"
            >
              {tTypes('Types.Slovník')}{' '}
              {activeType !== 'CONCEPT' &&
                `[${firstPage?.totalOntologies ?? 0}]`}
            </GovButton>
            <GovButton
              type={activeType === ApiSearchType.CONCEPT ? 'solid' : 'outlined'}
              onGovClick={() => toggleType(ApiSearchType.CONCEPT)}
              color="primary"
              size="xs"
            >
              {tTypes('Types.Pojem')}{' '}
              {activeType !== 'ONTOLOGY' &&
                `[${firstPage?.totalConcepts ?? 0}]`}
            </GovButton>
            {user?.userId && (
              <GovButton
                type={
                  activeSource === SearchSource.UNPUBLISHED
                    ? 'solid'
                    : 'outlined'
                }
                onGovClick={() => toggleSource(SearchSource.UNPUBLISHED)}
                color="warning"
                size="xs"
              >
                {tTypes('Types.Rozpracovaný')}
              </GovButton>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="h-full flex-1 flex items-center justify-center">
            <CircularLoader />
          </div>
        )}

        {results.map((item) => {
          if (item.type === 'ONTOLOGY') {
            const cardProps =
              item.source === 'ISMD'
                ? { type: 'ISMD' as const, id: 2 }
                : { type: 'NKD' as const, ontologyIRI: item.iri ?? '' };

            return (
              <DictionaryCard
                {...cardProps}
                key={item.iri ?? item.label}
                title={item.label || ''}
                text={item.description || item.definition || ''}
                link={
                  item.source === 'ISMD'
                    ? `/dictionary/${item.slug}`
                    : `/dictionary/nkd?iri=${item.iri}`
                }
                concepts={0}
                modified={
                  item.lastModified ? new Date(item.lastModified) : undefined
                }
              />
            );
          }

          if (item.type === 'CONCEPT') {
            return (
              <ConceptCard
                key={item.iri ?? item.label}
                title={item.label || ''}
                text={item.description || item.definition || ''}
                modified={
                  item.lastModified ? new Date(item.lastModified) : undefined
                }
                link={
                  item.source === 'ISMD'
                    ? `/concept/${item.slug}`
                    : `/concept/nkd?iri=${item.iri}`
                }
              />
            );
          }
        })}

        <div
          ref={sentinelRef}
          className="py-4 flex justify-center text-sm text-muted-foreground"
        >
          {isFetchingNextPage && <CircularLoader />}
          {!isFetchingNextPage && !hasNextPage && results.length > 0 && (
            <span>{t('NoMoreResults')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
