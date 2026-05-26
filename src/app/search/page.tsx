'use client';

import { useEffect, useRef, useState } from 'react';
import { GovButton } from '@gov-design-system-ce/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  SearchResultDto,
  SearchSource,
  SearchType as ApiSearchType,
} from '@/api/generated';
import { useSearch } from '@/api/generated';
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

  const [offset, setOffset] = useState(0);
  const [results, setResults] = useState<SearchResultDto[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOffset(0);
    setResults([]);
  }, [q, activeType, activeSource]);

  const { data, isFetching } = useSearch(
    { q, type: activeType, source: activeSource, offset, limit: LIMIT },
    { query: { enabled: q.trim().length > 1 } },
  );

  useEffect(() => {
    if (data?.success && data.data?.results && !isFetching) {
      setResults((prev) =>
        offset === 0
          ? (data.data?.results ?? [])
          : [...prev, ...(data.data?.results ?? [])],
      );
    }
  }, [isFetching, data, offset]);

  const totalCount =
    (data?.data?.totalOntologies ?? 0) + (data?.data?.totalConcepts ?? 0);
  const hasMore = totalCount > results.length;

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
    <div className="w-full py-10">
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
                `[${data?.data?.totalOntologies ?? 0}]`}
            </GovButton>
            <GovButton
              type={activeType === ApiSearchType.CONCEPT ? 'solid' : 'outlined'}
              onGovClick={() => toggleType(ApiSearchType.CONCEPT)}
              color="primary"
              size="xs"
            >
              {tTypes('Types.Pojem')}{' '}
              {activeType !== 'ONTOLOGY' &&
                `[${data?.data?.totalConcepts ?? 0}]`}
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

        {isFetching && results.length === 0 && (
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
          {isFetching && results.length > 0 && <CircularLoader />}
          {!isFetching && !hasMore && results.length > 0 && (
            <span>{t('NoMoreResults')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
