'use client';

import { useEffect, useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { useGetNkdOntologyList, useGetOntologyList } from '@/api/generated';
import { useCurrentUser } from '../contexts/CurrentUserProvider';
import {
  DictionaryCard,
  DictionaryCardProps,
} from '../shared/DictionaryCard/DictionaryCard';

export type VisitedEntry = {
  slug: string;
  source: 'ISMD' | 'NKD';
};

const getOntologyHref = (entry: VisitedEntry) => {
  if (entry.source === 'NKD') {
    return `/dictionary/nkd?iri=${encodeURIComponent(entry.slug)}`;
  }
  return `/dictionary/${entry.slug}`;
};

export const VisitedOntologies = () => {
  const t = useTranslations('Home');
  const { user } = useCurrentUser();

  const [visitedEntries, setVisitedEntries] = useState<VisitedEntry[]>([]);

  useEffect(() => {
    if (!user?.userId) return;
    const key = `dictionarySlugs_${user?.userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed: (string | VisitedEntry)[] = JSON.parse(stored);

      const entries: VisitedEntry[] = parsed.map((item) => {
        if (typeof item === 'string') {
          try {
            return { slug: decodeURIComponent(item), source: 'ISMD' as const };
          } catch {
            return { slug: item, source: 'ISMD' as const };
          }
        }
        return item;
      });

      setVisitedEntries(entries);
    }
  }, [user?.userId]);

  const ismdSlugs = visitedEntries
    .filter((e) => e.source === 'ISMD')
    .map((e) => e.slug);

  const nkdIris = visitedEntries
    .filter((e) => e.source === 'NKD' && e.slug)
    .map((e) => e.slug);

  const { data: ismd } = useGetOntologyList(
    { slugs: ismdSlugs },
    { query: { enabled: ismdSlugs.length > 0 } },
  );

  const { data: nkd } = useGetNkdOntologyList(
    { iris: nkdIris },
    { query: { enabled: nkdIris.length > 0 } },
  );

  const ismdOntologies = (ismd?.data ?? []).flatMap((item) =>
    item.id
      ? [
          {
            type: 'ISMD' as const,
            title: item.name || '',
            id: item.id,
            text: item.popis,
            modified: item.updatedAt ? new Date(item.updatedAt) : undefined,
            concepts: item.conceptCount || 0,
            link: getOntologyHref({ slug: item.slug || '', source: 'ISMD' }),
            isPublished: item.isPublished,
          },
        ]
      : [],
  ) satisfies DictionaryCardProps[];

  const nkdOntologies = (nkd?.data?.ontologies ?? []).map(
    (item): DictionaryCardProps => ({
      type: 'NKD',
      title: item.název?.cs || '',
      text: item.popis?.cs || '',
      modified: item['časový-okamžik-poslední-změny']
        ? new Date(item['časový-okamžik-poslední-změny'])
        : undefined,
      concepts: item['počet-pojmů'] || 0,
      link: getOntologyHref({ slug: item.iri || '', source: 'NKD' }),
      isPublished: true,
      ontologyIRI: item.iri || '',
    }),
  );

  const visitedOntologies = [...ismdOntologies, ...nkdOntologies];

  return (
    <div className="space-y-5 pb-10 mt-8 w-full">
      <h2 className="font-medium text-xl flex items-center gap-2">
        <GovIcon
          type="components"
          color="neutral"
          name="history"
          slot="icon-start"
          size="m"
          className="transition-transform duration-200"
        />
        {t('LastVisited.Title')}
      </h2>
      <div className="space-y-4">
        {visitedOntologies.map((item) => (
          <DictionaryCard {...item} key={item.title} />
        ))}
      </div>
    </div>
  );
};
