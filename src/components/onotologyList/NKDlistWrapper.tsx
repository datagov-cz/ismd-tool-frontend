'use client';

import { useEffect, useState } from 'react';

import {
  NkdOntologyListItemDto,
  useListAllNkdOntologies,
} from '@/api/generated';
import { DictionaryCardProps } from '../shared/DictionaryCard/DictionaryCard';

import { OntologyList } from './OntologyList';

const LIMIT = 5;

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
  const [offset, setOffset] = useState(0);
  const [ontologies, setOntologies] = useState<NkdOntologyListItemDto[]>([]);
  const [filterQuery, setFilterQuery] = useState('');

  const { data, isFetching } = useListAllNkdOntologies({
    offset,
    limit: LIMIT,
  });

  useEffect(() => {
    if (data?.data?.ontologies && !isFetching) {
      setOntologies((prev) => [...prev, ...(data.data?.ontologies ?? [])]);
    }
  }, [isFetching, data]);

  const totalCount = data?.data?.['celkový-počet'] ?? 0;
  const hasMore = totalCount > ontologies.length;

  const items = ontologies
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
      type="NKD"
      items={items}
      isFetching={isFetching}
      hasMore={hasMore}
      onLoadMore={() => setOffset((prev) => prev + LIMIT)}
      filterQuery={filterQuery}
      onFilterChange={setFilterQuery}
    />
  );
};
