'use client';

import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounceValue } from 'usehooks-ts';

import { listDatasets } from '@/api/generated';

import { DatasetList } from './DatasetList';

const LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

export const DatasetsListWrapper = () => {
  const [filterQuery, setFilterQuery] = useState('');
  const [debouncedFilterQuery] = useDebounceValue(
    filterQuery,
    SEARCH_DEBOUNCE_MS,
  );
  const normalizedFilterQuery = debouncedFilterQuery.trim();

  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['nkd-data-sets', 'infinite', normalizedFilterQuery],
    queryFn: ({ pageParam, signal }) =>
      listDatasets(
        {
          offset: pageParam,
          limit: LIMIT,
          q: normalizedFilterQuery || undefined,
        },
        undefined,
        signal,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const lastCount = lastPage.data?.datasets?.length ?? 0;

      if (lastCount < LIMIT) return undefined;

      const loaded = allPages.reduce(
        (sum, page) => sum + (page.data?.datasets?.length ?? 0),
        0,
      );
      return loaded;
    },
  });

  const datasets =
    data?.pages.flatMap((page) => page.data?.datasets ?? []) ?? [];

  return (
    <DatasetList
      items={datasets}
      isFetching={isFetching}
      hasMore={hasNextPage}
      onLoadMore={() => fetchNextPage()}
      filterQuery={filterQuery}
      onFilterChange={setFilterQuery}
    />
  );
};
