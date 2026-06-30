'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { listAllNkdOntologies, NkdOntologyListItemDto } from '@/api/generated';
import { DictionaryCardProps } from '../shared/DictionaryCard/DictionaryCard';

import { OntologyList } from './OntologyList';

const LIMIT = 20;

const toCardItem = (
  item: NkdOntologyListItemDto,
): DictionaryCardProps | null => {
  const hasNazev = item.název && Object.keys(item.název).length > 0;
  const hasPopis = item.popis && Object.keys(item.popis).length > 0;
  if (!hasNazev && !hasPopis) return null;

  return {
    title: item.název?.cs ?? '',
    text: item.popis?.cs,
    concepts: item['počet-pojmů'] ?? 0,
    modified: item['časový-okamžik-poslední-změny']
      ? new Date(item['časový-okamžik-poslední-změny'])
      : undefined,
    ontologyIRI: item.iri ?? '',
    type: 'NKD',
    link: `/dictionary/nkd?iri=${encodeURIComponent(item.iri ?? '')}`,
  };
};

export const NKDListWrapper = () => {
  const [filterQuery, setFilterQuery] = useState('');

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ['nkd-ontologies', 'infinite'],
      queryFn: ({ pageParam }) =>
        listAllNkdOntologies({ offset: pageParam, limit: LIMIT }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        const lastCount = lastPage.data?.ontologies?.length ?? 0;

        if (lastCount < LIMIT) return undefined;

        const loaded = allPages.reduce(
          (sum, page) => sum + (page.data?.ontologies?.length ?? 0),
          0,
        );
        return loaded;
      },
    });

  const items = useMemo(() => {
    const ontologies =
      data?.pages.flatMap((page) => page.data?.ontologies ?? []) ?? [];

    return ontologies
      .map(toCardItem)
      .filter((item): item is DictionaryCardProps => item !== null)
      .filter(
        (item) =>
          !filterQuery ||
          item.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
          item.text?.toLowerCase().includes(filterQuery.toLowerCase()),
      );
  }, [data, filterQuery]);

  return (
    <OntologyList
      type="NKD"
      items={items}
      isFetching={isLoading || isFetchingNextPage}
      hasMore={hasNextPage}
      onLoadMore={() => fetchNextPage()}
      filterQuery={filterQuery}
      onFilterChange={setFilterQuery}
    />
  );
};
