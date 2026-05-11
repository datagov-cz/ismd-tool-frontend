'use client';

import { useState } from 'react';

import {
  OntologyMetadataModel,
  useGetCurrentUser,
  useGetOntologyList,
} from '@/api/generated';
import { DictionaryCardProps } from '../shared/DictionaryCard/DictionaryCard';

import { OntologyList } from './OntologyList';

const toCardItem = (
  item: OntologyMetadataModel,
): DictionaryCardProps | null | undefined => {
  if (!item.name && !item.popis && !item.id) return null;

  if (item.id)
    return {
      title: item.name ?? '',
      text: item.popis,
      concepts: item.conceptCount ?? 0,
      modified: item.updatedAt ? new Date(item.updatedAt) : undefined,
      id: item.id,
      type: 'ISMD',
      link: `/dictionary/${item.slug}`,
    };
};

export const ISMDListWrapper = () => {
  const [filterQuery, setFilterQuery] = useState('');
  const { data: user } = useGetCurrentUser();

  const { data, isFetching } = useGetOntologyList(
    { userId: user?.data?.userId, isPublished: false },
    { query: { enabled: !!user?.data?.userId } },
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
