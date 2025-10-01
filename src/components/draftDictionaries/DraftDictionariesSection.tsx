'use client';

import { useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { tempDraftDictionaries } from '@/lib/constants';

import { DraftDictionaryCard } from './DraftDictionaryCard';

export const DraftDictionariesSection = () => {
  const t = useTranslations('Home');

  const [isShowAll, setIsShowAll] = useState(false);

  return (
    <div className="space-y-5 pb-10">
      <h2 className="font-medium text-xl">
        {t('DraftDictionariesSection.Title')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tempDraftDictionaries
          .slice(0, isShowAll ? undefined : 3)
          .map(({ id, title, text }) => (
            <DraftDictionaryCard key={id} title={title} link="/" text={text} />
          ))}
      </div>
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
    </div>
  );
};
