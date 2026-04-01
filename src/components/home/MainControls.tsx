'use client';

import { GovButton } from '@gov-design-system-ce/react';
import { Session } from 'next-auth';
import { useTranslations } from 'next-intl';

import { ButtonLink } from '../shared/ButtonLink';
import { Searchbar } from '../shared/Searchbar';
import { UploadFlow } from '../uploadFlow/UploadFlow';

interface Props {
  session: Session | null;
}

export const MainControls = ({ session }: Props) => {
  const t = useTranslations('Home');

  return (
    <div className="space-y-4">
      {session && (
        <div className="flex gap-4 flex-wrap justify-center mx-auto max-w-[780px]">
          <UploadFlow />
          <ButtonLink
            type="solid"
            size="m"
            color="primary"
            slot="button"
            href="/dictionary/create"
          >
            {t('MainControls.CreateNewDict')}
          </ButtonLink>
        </div>
      )}
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
