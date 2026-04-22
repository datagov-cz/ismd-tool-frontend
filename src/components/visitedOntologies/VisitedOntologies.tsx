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

export const VisitedOntologies = () => {
  const t = useTranslations('Home');
  const { data } = useGetCurrentUser();
  const user = data?.data;

  const [visitedSlugs, setVisitedSlugs] = useState<string[]>([]);
  const [cachedOntologies, setCachedOntologies] = useState<
    OntologyMetadataModel[]
  >([]);

  useEffect(() => {
    if (!user?.userId) return;
    const key = `dictionarySlugs_${user?.userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);

      const decodedSlugs = parsed.map((slug: string) => {
        try {
          return decodeURIComponent(slug);
        } catch {
          return slug;
        }
      });

      setVisitedSlugs(decodedSlugs);
    }
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem('cached-visited-ontologies');
    if (cached) {
      setCachedOntologies(JSON.parse(cached));
    }
  }, []);

  const getOntologies = useGetOntologyList(
    {
      slugs: visitedSlugs,
    },
    { query: { enabled: visitedSlugs.length > 0 } },
  );

  useEffect(() => {
    const newData = getOntologies.data?.data;
    if (!newData || newData === cachedOntologies) return;

    setCachedOntologies(newData);
    localStorage.setItem('cached-visited-ontologies', JSON.stringify(newData));
  }, [getOntologies, cachedOntologies]);

  const visitedOntologies = (
    getOntologies.data?.data || cachedOntologies
  )?.sort(
    (a, b) =>
      visitedSlugs.indexOf(a.slug || '') - visitedSlugs.indexOf(b.slug || ''),
  );

  useEffect(() => {
    if (visitedSlugs.length > 0) {
      getOntologies.refetch();
    }
  }, [visitedSlugs]);

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
        {visitedOntologies
          ?.slice(0, 4)
          .map(
            ({ id, name, slug, popis, concepts, updatedAt }) =>
              name &&
              id && (
                <DictionaryCard
                  key={id || slug}
                  title={name}
                  link={`/dictionary/${slug}`}
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
