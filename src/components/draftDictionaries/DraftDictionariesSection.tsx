'use client';

import { useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { useGetOntologyList } from '@/api/generated';

import { DraftDictionaryCard } from './DraftDictionaryCard';

export const DraftDictionariesSection = () => {
  const t = useTranslations('Home');

  //TODO: add real user
  const ontologies = useGetOntologyList({ userId: 'test' });

  const [isShowAll, setIsShowAll] = useState(false);

  return (
    <div className="space-y-5 pb-10">
      <h2 className="font-medium text-xl">
        {t('DraftDictionariesSection.Title')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ontologies.data?.data
          ?.slice(0, isShowAll ? undefined : 3)
          .map(
            ({ id, name, slug }) =>
              id &&
              name && (
                <DraftDictionaryCard
                  key={id}
                  title={name}
                  link={`/dictionary/${slug}`}
                  text="Lorem ipsum dolor sit amet consectetur, adipisicing elit. Laudantium, totam ab commodi ut veniam similique laboriosam enim odit quaerat cupiditate?"
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
