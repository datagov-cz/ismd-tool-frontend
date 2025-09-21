'use client';

import { useUserStore } from '@/store/userStore';
import {
  GovButton,
  GovFormControl,
  GovFormGroup,
  GovFormInput,
  GovFormSearch,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

export const MainControls = () => {
  const t = useTranslations('Home');
  const user = useUserStore((state) => state.user);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap justify-center mx-auto max-w-[780px]">
        <GovButton type="solid" size="m" color="primary" slot="button">
          {t('MainControls.OpenDictFromFile')}
        </GovButton>
        <GovButton type="solid" size="m" color="primary" slot="button">
          {t('MainControls.CreateNewDict')}
        </GovButton>
      </div>
      {/* TODO: Replace with custom search: search is not triggering any event */}
      <GovFormControl className="w-full">
        <GovFormGroup>
          <GovFormSearch>
            <GovFormInput
              slot="input"
              placeholder={t('MainControls.SearchPlaceholder')}
            />
            <GovButton slot="button">
              <GovIcon name="search" slot="icon-start" />
            </GovButton>
          </GovFormSearch>
        </GovFormGroup>
      </GovFormControl>
      {user && (
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
