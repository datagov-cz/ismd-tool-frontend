'use client';

import { useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { useGetCurrentUser, useGetOntologyList } from '@/api/generated';

import { DraftDictionaryCard } from './DraftDictionaryCard';

export const DraftDictionariesSection = () => {
  const t = useTranslations('Home');

  const { data } = useGetCurrentUser();
  const user = data?.data;

  const ontologies = useGetOntologyList(
    { userId: user?.userId },
    { query: { enabled: !!user?.userId } },
  );

  const [isShowAll, setIsShowAll] = useState(false);

  return (
    <div className="space-y-5 pb-10 pt-4 w-full">
      <h2 className="font-medium text-xl flex items-center gap-2">
        <GovIcon
          type="components"
          color="secondary"
          name="journals"
          slot="icon-start"
          size="m"
          className="transition-transform duration-200"
        />
        {t('DraftDictionariesSection.Title')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ontologies.data?.data
          ?.slice(0, isShowAll ? undefined : 3)
          .map(
            ({ id, name, slug, popis, concepts, updatedAt }) =>
              id &&
              name && (
                <DraftDictionaryCard
                  key={id}
                  title={name}
                  link={`/dictionary/${slug}`}
                  text={popis || ''}
                  concepts={concepts?.length ?? 0}
                  modified={updatedAt ? new Date(updatedAt) : undefined}
                />
              ),
          )}
      </div>
      {ontologies?.data?.data && ontologies.data.data.length > 3 && (
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
