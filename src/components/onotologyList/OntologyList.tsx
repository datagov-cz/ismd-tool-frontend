'use client';

import { useEffect, useRef } from 'react';
import {
  GovFormGroup,
  GovFormInput,
  GovIcon,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { CircularLoader } from '../shared/CircularLoader';
import {
  DictionaryCard,
  DictionaryCardProps,
} from '../shared/DictionaryCard/DictionaryCard';

type OntologyListProps = {
  type: 'NKD' | 'ISMD';
  items: DictionaryCardProps[];
  isFetching: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  filterQuery: string;
  onFilterChange: (_value: string) => void;
};

export const OntologyList = ({
  type,
  items,
  isFetching,
  hasMore = false,
  onLoadMore,
  filterQuery,
  onFilterChange,
}: OntologyListProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('OntologyList');
  const isISMD = type === 'ISMD';

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
        <h1 className="pb-3 text-xl font-medium">
          {isISMD ? t('ISMDTitle') : t('NKDTitle')}
        </h1>
        {!isISMD && (
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
        )}
      </div>

      {isFetching && items.length === 0 && <CircularLoader />}

      <div className={clsx(isISMD ? 'grid grid-cols-2 gap-3' : 'space-y-3')}>
        {items.map((item) => (
          <DictionaryCard key={item.title} {...item} />
        ))}
      </div>

      <div
        ref={sentinelRef}
        className="py-4 flex justify-center text-sm text-muted-foreground"
      >
        {isFetching && items.length > 0 && <CircularLoader />}
        {!isFetching && !hasMore && items.length > 0 && <span />}
      </div>
    </div>
  );
};
