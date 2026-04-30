'use client';

import { useEffect, useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import {
  type OntologyMetadataModel,
  useGetCurrentUser,
  useGetOntologyList,
} from '@/api/generated';
import { DictionaryCard } from '../shared/DictionaryCard/DictionaryCard';

export type VisitedEntry = {
  slug: string;
  source: 'ISMD' | 'NKD';
  iri?: string;
  name?: string;
};

const getOntologyHref = (entry: VisitedEntry) => {
  if (entry.source === 'NKD') {
    return `/dictionary/nkd?iri=${encodeURIComponent(entry.iri || entry.slug)}`;
  }
  return `/dictionary/${entry.slug}`;
};

export const VisitedOntologies = () => {
  const t = useTranslations('Home');
  const { data } = useGetCurrentUser();
  const user = data?.data;

  const [visitedEntries, setVisitedEntries] = useState<VisitedEntry[]>([]);
  const [cachedOntologies, setCachedOntologies] = useState<
    OntologyMetadataModel[]
  >([]);

  useEffect(() => {
    if (!user?.userId) return;
    const key = `dictionarySlugs_${user?.userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed: (string | VisitedEntry)[] = JSON.parse(stored);

      // Backwards-compat: migrate plain strings (old format) to entry objects
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

  useEffect(() => {
    const cached = localStorage.getItem('cached-visited-ontologies');
    if (cached) {
      setCachedOntologies(JSON.parse(cached));
    }
  }, []);

  const ismdSlugs = visitedEntries
    .filter((e) => e.source === 'ISMD')
    .map((e) => e.slug);

  const getOntologies = useGetOntologyList(
    { slugs: ismdSlugs },
    { query: { enabled: ismdSlugs.length > 0 } },
  );

  useEffect(() => {
    const newData = getOntologies.data?.data;
    if (!newData || newData === cachedOntologies) return;

    setCachedOntologies(newData);
    localStorage.setItem('cached-visited-ontologies', JSON.stringify(newData));
  }, [getOntologies, cachedOntologies]);

  useEffect(() => {
    if (ismdSlugs.length > 0) {
      getOntologies.refetch();
    }
  }, [visitedEntries]);

  const visitedOntologies = visitedEntries
    .slice(0, 4)
    .map((entry) => {
      if (entry.source === 'ISMD') {
        const ontology = (getOntologies.data?.data || cachedOntologies)?.find(
          (o) => o.slug === entry.slug,
        );
        return {
          ...(ontology ?? {
            id: entry.slug,
            name: entry.name,
            slug: entry.slug,
            popis: '',
            concepts: [],
            updatedAt: undefined,
          }),
          _href: getOntologyHref(entry),
        };
      }
      return {
        id: entry.iri || entry.slug,
        name: entry.name || entry.slug,
        slug: entry.slug,
        popis: '',
        concepts: [],
        updatedAt: undefined,
        _href: getOntologyHref(entry),
      };
    })
    .filter(Boolean) as (OntologyMetadataModel & { _href: string })[];

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
        {visitedOntologies.map(
          ({ id, name, slug, popis, concepts, updatedAt, _href }) =>
            name &&
            id && (
              <DictionaryCard
                key={id || slug}
                title={name}
                link={_href}
                text={popis || ''}
                concepts={concepts?.length ?? 0}
                modified={updatedAt ? new Date(updatedAt) : undefined}
                id={id}
              />
            ),
        )}
      </div>
    </div>
  );
};
