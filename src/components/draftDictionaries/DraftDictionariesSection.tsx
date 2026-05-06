'use client';

import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { useGetCurrentUser, useGetOntologyList } from '@/api/generated';
import { CircularLoader } from '../shared/CircularLoader';
import { DictionaryCard } from '../shared/DictionaryCard/DictionaryCard';

export const DraftDictionariesSection = () => {
  const t = useTranslations('Home');

  const { data } = useGetCurrentUser();
  const user = data?.data;

  const ontologies = useGetOntologyList(
    { userId: user?.userId, isPublished: false },
    { query: { enabled: !!user?.userId } },
  );

  const isLoading = ontologies.isLoading || !user?.userId;

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {isLoading ? (
          <CircularLoader />
        ) : (
          ontologies.data?.data
            ?.slice(0, 8)
            .map(
              ({ id, name, slug, popis, concepts, updatedAt, isPublished }) =>
                id &&
                name && (
                  <DictionaryCard
                    type="ISMD"
                    key={id}
                    title={name}
                    link={`/dictionary/${slug}`}
                    text={popis || ''}
                    concepts={concepts?.length ?? 0}
                    modified={updatedAt ? new Date(updatedAt) : undefined}
                    id={id}
                    isPublished={isPublished ?? false}
                  />
                ),
            )
        )}
      </div>
      <div className="w-full flex items-center justify-center">
        {!isLoading &&
          ontologies?.data?.data &&
          ontologies.data.data.length > 1 && (
            <GovButton
              type="outlined"
              color="primary"
              className="flex items-center gap-3 mx-auto cursor-pointer text-blue-primary hover:underline"
              href={`${process.env.NEXT_PUBLIC_BASE_PATH}/dictionary/list`}
            >
              {t('DraftDictionariesSection.ShowAll')} (
              {ontologies.data.data.length})
              <GovIcon name="arrow-right" slot="icon-end" />
            </GovButton>
          )}
      </div>
    </div>
  );
};
