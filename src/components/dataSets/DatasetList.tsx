'use client';

import { useEffect, useRef } from 'react';
import {
  GovFormGroup,
  GovFormInput,
  GovIcon,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { NkodDatasetListItemDto } from '@/api/generated';
import { CircularLoader } from '../shared/CircularLoader';

import { DatasetCard } from './DatasetCard';

type DatasetListProps = {
  items: NkodDatasetListItemDto[];
  isFetching: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  filterQuery: string;
  onFilterChange: (_value: string) => void;
};

export const DatasetList = ({
  items,
  isFetching,
  hasMore = false,
  onLoadMore,
  filterQuery,
  onFilterChange,
}: DatasetListProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('DatasetList');

  useEffect(() => {
    if (!sentinelRef.current || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isFetching, hasMore, onLoadMore]);

  return (
    <div className="space-y-4 max-w-250 mx-auto py-8">
      <div>
        <h1 className="pb-3 text-xl font-medium">{t('AllTitle')}</h1>
        <GovFormGroup className="relative w-full max-w-60">
          <GovFormInput
            className="max-w-60 w-full border-0!"
            size="s"
            placeholder={t('SearchOntologies')}
            value={filterQuery}
            onGovInput={(e) => onFilterChange(e.detail.value ?? '')}
          >
            <GovIcon
              type="components"
              color="neutral"
              name="funnel"
              slot="icon-start"
              size="s"
              className="transition-transform duration-200"
            />
          </GovFormInput>
        </GovFormGroup>
      </div>

      {isFetching && items.length === 0 && <CircularLoader />}

      <div className={clsx('space-y-3')}>
        {items.map((item) => (
          <DatasetCard key={item.iri} {...item} />
        ))}
      </div>

      <div
        ref={sentinelRef}
        className="py-4 flex justify-center text-sm text-muted-foreground"
      >
        {isFetching && items.length > 0 && <CircularLoader />}
        {!isFetching && !hasMore && items.length > 0 && (
          <span>{t('NoMoreResults')}</span>
        )}
      </div>
    </div>
  );
};
