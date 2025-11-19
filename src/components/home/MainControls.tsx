'use client';

import { GovButton } from '@gov-design-system-ce/react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Searchbar } from '../shared/Searchbar';
import { UploadFlow } from '../uploadFlow/UploadFlow';

export const MainControls = () => {
  const t = useTranslations('Home');
  const { data: session } = useSession();

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap justify-center mx-auto max-w-[780px]">
        <UploadFlow />
        <GovButton
          type="solid"
          size="m"
          color="primary"
          slot="button"
          href="/dictionary/create"
        >
          {t('MainControls.CreateNewDict')}
        </GovButton>
      </div>
      {/* TODO: Replace with custom search: search is not triggering any event */}
      <Searchbar
        placeholder={t('MainControls.SearchPlaceholder')}
        hasSearchIcon
      />
      {session && (
        <div className="flex gap-4 flex-wrap justify-center">
          <GovButton type="solid" size="m" color="primary">
            {t('MainControls.Logged.DraftDictionaries')}
          </GovButton>
          <GovButton type="solid" size="m" color="primary">
            {t('MainControls.Logged.PublishedDictionaries')}
          </GovButton>
          <GovButton type="solid" size="m" color="primary">
            {t('MainControls.Logged.Definitions')}
          </GovButton>
          <GovButton type="solid" size="m" color="primary">
            {t('MainControls.Logged.Diagrams')}
          </GovButton>
        </div>
      )}
    </div>
  );
};
