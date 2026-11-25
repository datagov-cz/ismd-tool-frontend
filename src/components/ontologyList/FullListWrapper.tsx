'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import {
  getOntologyList,
  listAllNkdOntologies,
  NkdOntologyListItemDto,
  OntologySummaryDto,
} from '@/api/generated';
import {
  DictionaryCardProps,
  getPreferredTranslation,
} from '../shared/DictionaryCard/DictionaryCard';

import { OntologyList } from './OntologyList';

const LIMIT = 20;

const ismdToCardItem = (
  item: OntologySummaryDto,
): DictionaryCardProps | null => {
  if (!item.id || (!item.name && !item.popis)) return null;

  return {
    title: getPreferredTranslation(item.name) ?? '',
    titleTranslations: item.name,
    text: getPreferredTranslation(item.popis),
    textTranslations: item.popis,
    concepts: item.conceptCount ?? 0,
    modified: item.updatedAt ? new Date(item.updatedAt) : undefined,
    id: item.id,
    type: 'ISMD',
    link: `/dictionary/${item.slug}`,
  };
};

const nkdToCardItem = (
  item: NkdOntologyListItemDto,
): DictionaryCardProps | null => {
  const hasName = item.název && Object.keys(item.název).length > 0;
  const hasDescription = item.popis && Object.keys(item.popis).length > 0;
  if (!hasName && !hasDescription) return null;

  return {
    title: getPreferredTranslation(item.název) ?? '',
    titleTranslations: item.název,
    text: getPreferredTranslation(item.popis),
    textTranslations: item.popis,
    concepts: item['počet-pojmů'] ?? 0,
    modified: item['časový-okamžik-poslední-změny']
      ? new Date(item['časový-okamžik-poslední-změny'])
      : undefined,
    ontologyIRI: item.iri ?? '',
    type: 'NKD',
    link: `/dictionary/nkd?iri=${encodeURIComponent(item.iri ?? '')}`,
  };
};

export const FullListWrapper = () => {
  const [filterQuery, setFilterQuery] = useState('');
  const {
    data: ismdData,
    isLoading: isLoadingISMD,
    isFetchingNextPage: isFetchingNextISMD,
    fetchNextPage: fetchNextISMD,
    hasNextPage: hasNextISMD,
  } = useInfiniteQuery({
    queryKey: ['ontology-list', 'all', filterQuery.trim()],
    queryFn: ({ pageParam }) =>
      getOntologyList({
        q: filterQuery.trim() || undefined,
        limit: LIMIT,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const page = lastPage.data;
      if (!page || page.offset + page.items.length >= page.totalCount) {
        return undefined;
      }
      return page.offset + page.items.length;
    },
  });
  const {
    data: nkdData,
    isLoading: isLoadingNKD,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['nkd-ontologies', 'full-list'],
    queryFn: ({ pageParam }) =>
      listAllNkdOntologies({ offset: pageParam, limit: LIMIT }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const lastCount = lastPage.data?.ontologies?.length ?? 0;
      if (lastCount < LIMIT) return undefined;

      return allPages.reduce(
        (total, page) => total + (page.data?.ontologies?.length ?? 0),
        0,
      );
    },
  });

  const items = useMemo(() => {
    const ismdItems =
      ismdData?.pages
        .flatMap((page) => page.data?.items ?? [])
        .map(ismdToCardItem) ?? [];
    const nkdItems =
      nkdData?.pages
        .flatMap((page) => page.data?.ontologies ?? [])
        .map(nkdToCardItem) ?? [];
    const normalizedQuery = filterQuery.trim().toLocaleLowerCase('cs');

    return [...ismdItems, ...nkdItems]
      .filter((item): item is DictionaryCardProps => item !== null)
      .filter(
        (item) =>
          item.type === 'ISMD' ||
          !normalizedQuery ||
          item.title.toLocaleLowerCase('cs').includes(normalizedQuery) ||
          item.text?.toLocaleLowerCase('cs').includes(normalizedQuery),
      );
  }, [filterQuery, ismdData, nkdData]);

  return (
    <OntologyList
      items={items}
      isFetching={
        isLoadingISMD ||
        isFetchingNextISMD ||
        isLoadingNKD ||
        isFetchingNextPage
      }
      hasMore={hasNextISMD || hasNextPage}
      onLoadMore={() => {
        if (hasNextISMD) void fetchNextISMD();
        if (hasNextPage) void fetchNextPage();
      }}
      filterQuery={filterQuery}
      onFilterChange={setFilterQuery}
    />
  );
};
