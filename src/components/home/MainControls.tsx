'use client';

import { GovButton } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { useUserStore } from '@/store/userStore';
import { Searchbar } from '../shared/Searchbar';

export const MainControls = () => {
  const t = useTranslations('Home');
  const user = useUserStore((state) => state.user);

  // const { mutate, isPending } = useCreateOntology();

  // TODO: change placeholder values
  // const handleCreateOntology = () => {
  //   mutate(
  //     {
  //       userId: 'test',
  //       ontology: { namespace: 'test', name: 'test', description: 'test' },
  //     },
  //     {
  //       onSuccess: () => {
  //         toast(t('MainControls.CreateNewDictSuccess'));
  //       },
  //       onError: (error) => {
  //         console.error('Failed to create ontology:', error);
  //         toast(t('MainControls.CreateNewDictError'));
  //       },
  //     },
  //   );
  // };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap justify-center mx-auto max-w-[780px]">
        <GovButton type="solid" size="m" color="primary" slot="button">
          {t('MainControls.OpenDictFromFile')}
        </GovButton>
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
