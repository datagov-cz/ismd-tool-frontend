'use client';

import { useEffect, useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import {
  type OntologyMetadataModel,
  useGetOntologyList,
} from '@/api/generated';
import { DraftDictionaryCard } from '../draftDictionaries/DraftDictionaryCard';

export const VisitedOntologies = () => {
  const t = useTranslations('Home');
  const user = { id: 'test' };

  const [visitedSlugs, setVisitedSlugs] = useState<string[]>([]);
  const [isShowAll, setIsShowAll] = useState(false);
  const [cachedOntologies, setCachedOntologies] = useState<
    OntologyMetadataModel[]
  >([]);

  useEffect(() => {
    const key = `dictionarySlugs_${user.id}`;
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
    <div className="space-y-5 pb-10 mt-8">
      <h2 className="font-medium text-xl">{t('LastVisited.Title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visitedOntologies
          ?.slice(0, isShowAll ? undefined : 3)
          .map(
            ({ id, name, slug, popis }) =>
              name && (
                <DraftDictionaryCard
                  key={id || slug}
                  title={name}
                  link={`/dictionary/${slug}`}
                  text={popis || ''}
                />
              ),
          )}
      </div>

      {visitedOntologies && visitedOntologies.length > 3 && (
        <button
          type="button"
          onClick={() => setIsShowAll(!isShowAll)}
          className="flex items-center gap-3 ml-auto cursor-pointer text-blue-primary hover:underline"
        >
          {t(
            isShowAll
              ? 'DraftDictionariesSection.ShowLess'
              : 'DraftDictionariesSection.ShowMore',
          )}
          <GovIcon
            name="chevron-up"
            slot="icon-end"
            className={`${isShowAll ? '' : 'rotate-180'} transition-transform duration-200`}
          />
        </button>
      )}
    </div>
  );
};
