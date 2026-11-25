'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { getOntologyList, OntologySummaryDto } from '@/api/generated';
import { useCurrentUser } from '../contexts/CurrentUserProvider';
import {
  DictionaryCardProps,
  getPreferredTranslation,
} from '../shared/DictionaryCard/DictionaryCard';

import { OntologyList } from './OntologyList';

const toCardItem = (item: OntologySummaryDto): DictionaryCardProps | null => {
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

export const ISMDListWrapper = () => {
  const { user } = useCurrentUser();
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ['ontology-list', 'user', user?.userId],
      queryFn: ({ pageParam }) =>
        getOntologyList({ userId: user?.userId, limit: 20, offset: pageParam }),
      initialPageParam: 0,
      enabled: !!user?.userId,
      getNextPageParam: (lastPage) => {
        const page = lastPage.data;
        if (!page || page.offset + page.items.length >= page.totalCount) {
          return undefined;
        }
        return page.offset + page.items.length;
      },
    });

  const items = (data?.pages.flatMap((page) => page.data?.items ?? []) ?? [])
    .map(toCardItem)
    .filter((item): item is DictionaryCardProps => item !== null);

  return (
    <OntologyList
      type="ISMD"
      items={items}
      isFetching={isLoading || isFetchingNextPage}
      hasMore={hasNextPage}
      onLoadMore={() => fetchNextPage()}
      filterQuery=""
      onFilterChange={() => undefined}
    />
  );
};
