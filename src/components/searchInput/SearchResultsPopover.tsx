'use client';

import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { SearchResponseDto, SearchType } from '@/api/generated';
import { CircularLoader } from '../shared/CircularLoader';

import { SearchResultColumn } from './SearchResultColumn';

const CONCEPT_PREVIEW_LIMIT = 5;
const ONTOLOGY_PREVIEW_LIMIT = 5;

type Props = {
  data?: SearchResponseDto;
  type?: SearchType;
  query: string;
  onClose?: () => void;
  loading?: boolean;
};

export const SearchResultsPopover = ({
  data,
  query,
  onClose,
  type,
  loading,
}: Props) => {
  const t = useTranslations('Search');

  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
        <CircularLoader />
      </div>
    );
  }

  const ontologies =
    data?.results
      ?.filter((r) => r.type === 'ONTOLOGY')
      .slice(0, ONTOLOGY_PREVIEW_LIMIT) ?? [];
  const concepts =
    data?.results
      ?.filter((r) => r.type === 'CONCEPT')
      .slice(0, CONCEPT_PREVIEW_LIMIT) ?? [];

  const totalConcepts = Object.values(data?.sourceStatuses ?? {}).reduce(
    (acc, s) => acc + (s.totalConcepts ?? 0),
    0,
  );

  const handleDetailSearch = (searchType?: SearchType) =>
    `/search?q=${encodeURIComponent(query)}${searchType ? `&type=${searchType}` : ''}`;

  const showOntologies = !type || type !== SearchType.CONCEPT;
  const showConcepts = !type || type !== SearchType.ONTOLOGY;

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
      <div
        className={clsx(
          'grid divide-x divide-gray-200',
          type ? 'grid-cols-1' : 'grid-cols-2',
        )}
      >
        {showOntologies && (
          <SearchResultColumn
            type={SearchType.ONTOLOGY}
            items={ontologies}
            remaining={
              ontologies.length > 0
                ? totalConcepts - ontologies.length
                : undefined
            }
            moreHref={handleDetailSearch(SearchType.ONTOLOGY)}
            query={query}
            onClose={onClose}
          />
        )}

        {showConcepts && (
          <SearchResultColumn
            type={SearchType.CONCEPT}
            items={concepts}
            remaining={
              concepts.length > 0 ? totalConcepts - concepts.length : undefined
            }
            moreHref={handleDetailSearch(SearchType.CONCEPT)}
            query={query}
            onClose={onClose}
          />
        )}
      </div>

      <div className="border-t border-gray-200 py-3 flex justify-center">
        <GovButton
          type="solid"
          color="primary"
          size="s"
          href={handleDetailSearch(type)}
          onClick={onClose}
        >
          {t('DetailSearch')}
          <GovIcon type="components" name="search" size="s" />
        </GovButton>
      </div>
    </div>
  );
};
