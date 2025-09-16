import { GovButton } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { Searchbar } from '../shared/Searchbar';

export const MainControls = () => {
  const t = useTranslations('Home');

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
      <Searchbar
        placeholder={t('MainControls.SearchPlaceholder')}
        hasSearchIcon
      />
    </div>
  );
};
