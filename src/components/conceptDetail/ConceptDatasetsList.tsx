'use client';

import { useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import {
  NkodDatasetListItemDto,
  useListDatasetsByConcept,
} from '@/api/generated';
import { getPreferredTranslation } from '@/components/dataSets/DatasetCard';

interface Props {
  conceptIri?: string;
}

type DatasetWithIri = NkodDatasetListItemDto & { iri: string };

export const ConceptDatasetsList = ({ conceptIri }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations('ConceptDetail.Groups');
  const datasetsQuery = useListDatasetsByConcept(
    { iri: conceptIri ?? '' },
    { query: { enabled: Boolean(conceptIri) } },
  );
  const datasets = (datasetsQuery.data?.data?.datasets ?? []).filter(
    (dataset): dataset is DatasetWithIri => Boolean(dataset.iri),
  );
  if (datasets.length === 0) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-lg bg-surface px-4 py-3 shadow-subtle">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between gap-1.5 text-left text-base leading-6 font-bold tracking-[0.2px] text-accent"
      >
        {t('Dataset')} [{datasets.length}]
        <GovIcon
          name="chevron-compact-down"
          type="components"
          size="xl"
          className={clsx(
            'shrink-0 transition-transform duration-200',
            expanded && 'rotate-180',
          )}
        />
      </button>

      {expanded && (
        <div className="divide-y divide-border-default rounded-lg bg-surface-base">
          {datasets.map((dataset) => {
            const name = getPreferredTranslation(dataset.název) ?? dataset.iri;
            const description = getPreferredTranslation(dataset.popis);

            return (
              <article key={dataset.iri} className="flex flex-col gap-3 py-2">
                <div className="flex flex-col gap-1.5 text-base leading-6 tracking-[0.2px]">
                  <h3 className="font-bold text-foreground">{name}</h3>
                  {description && (
                    <p className="text-card-description">{description}</p>
                  )}
                </div>

                <Link
                  href={{
                    pathname: '/dataset/detail',
                    query: { iri: dataset.iri },
                  }}
                  className="flex w-fit items-center gap-1.5 text-base leading-6 font-bold tracking-[0.2px] text-accent hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-primary"
                >
                  {t('ShowDatasetDetail')}
                  <GovIcon name="arrow-right" type="components" size="s" />
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
