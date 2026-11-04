'use client';

import { useState } from 'react';

import { OntologyMetadataModel, useGetOntologyList } from '@/api/generated';
import { useCurrentUser } from '../contexts/CurrentUserProvider';
import {
  DictionaryCardProps,
  getPreferredTranslation,
} from '../shared/DictionaryCard/DictionaryCard';

import { OntologyList } from './OntologyList';

const toCardItem = (
  item: OntologyMetadataModel,
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

export const ISMDListWrapper = () => {
  const [filterQuery, setFilterQuery] = useState('');
  const { user } = useCurrentUser();

  const { data, isFetching } = useGetOntologyList(
    { userId: user?.userId },
    { query: { enabled: !!user?.userId } },
  );

  const items = (data?.data ?? [])
    .map(toCardItem)
    .filter((item): item is DictionaryCardProps => item !== null)
    .filter(
      (item) =>
        !filterQuery ||
        item.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
        item.text?.toLowerCase().includes(filterQuery.toLowerCase()),
    );

  return (
    <OntologyList
      type="ISMD"
      items={items}
      isFetching={isFetching}
      filterQuery={filterQuery}
      onFilterChange={setFilterQuery}
    />
  );
};
