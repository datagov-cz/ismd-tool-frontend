'use client';

import { useEffect, useRef, useState } from 'react';
import {
  GovFormGroup,
  GovFormInput,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import {
  NkdOntologyListItemDto,
  useListAllNkdOntologies,
} from '@/api/generated';
import { CircularLoader } from '../shared/CircularLoader';
import { DictionaryCard } from '../shared/DictionaryCard/DictionaryCard';

const LIMIT = 5;

export const OntologyList = ({ type }: { type: 'NKD' | 'ISMD' }) => {
  const [offset, setOffset] = useState(0);
  const [ontologies, setOntologies] = useState<NkdOntologyListItemDto[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isFetching } = useListAllNkdOntologies({
    offset,
    limit: LIMIT,
  });
  const t = useTranslations('OntologyList');

  useEffect(() => {
    if (data?.data?.ontologies && !isFetching) {
      setOntologies((prev) => [...prev, ...(data.data?.ontologies ?? [])]);
    }
  }, [isFetching, data]);

  const totalCount = data?.data?.['celkový-počet'] ?? 0;
  const hasMore = totalCount > ontologies.length;

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && hasMore) {
          setOffset((prev) => prev + LIMIT);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isFetching, hasMore]);

  const filtered = ontologies.filter((item) => {
    const matchesFilter =
      !filterQuery ||
      item.název?.cs?.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.popis?.cs?.toLowerCase().includes(filterQuery.toLowerCase());
    const hasNazev = item.název && Object.keys(item.název).length > 0;
    const hasPopis = item.popis && Object.keys(item.popis).length > 0;
    return (hasNazev || hasPopis) && matchesFilter;
  });

  return (
    <div className="space-y-4 max-w-250 mx-auto py-8">
      <div>
        <h1 className="pb-3 text-xl font-medium">
          {type === 'NKD' ? t('NKDTitle') : t('ISMDTitle')}
        </h1>
        <GovFormGroup className="relative w-full max-w-60">
          <GovFormInput
            className="max-w-60 w-full border-0!"
            size="s"
            placeholder={t('SearchOntologies')}
            value={filterQuery}
            onGovInput={(e) => setFilterQuery(e.detail.value ?? '')}
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

      {filtered.map((item) => (
        <DictionaryCard
          key={item.iri}
          title={item.název?.cs || ''}
          text={item.popis?.cs}
          concepts={item['počet-pojmů'] || 0}
          modified={
            item['časový-okamžik-poslední-změny']
              ? new Date(item['časový-okamžik-poslední-změny'])
              : undefined
          }
          ontologyIRI={item.iri || ''}
          type="NKD"
          link={`/dictionary/nkd?iri=${encodeURIComponent(item.iri || '')}`}
        />
      ))}

      <div
        ref={sentinelRef}
        className="py-4 flex justify-center text-sm text-muted-foreground"
      >
        {isFetching && <CircularLoader />}
        {!isFetching && !hasMore && ontologies.length > 0 && <span></span>}
      </div>
    </div>
  );
};
