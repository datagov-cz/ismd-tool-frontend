'use client';

import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

export const MainControls = () => {
  const t = useTranslations('Home');

  return (
    <div className="space-y-4 pb-4 pt-2 w-full">
      <div className="flex gap-4 flex-wrap justify-center mx-auto max-w-195">
        <GovButton
          type="solid"
          size="m"
          color="secondary"
          slot="button"
          href={`${process.env.NEXT_PUBLIC_BASE_PATH}/dictionary/create`}
        >
          <GovIcon
            type="components"
            color="neutral"
            name="journal-plus"
            slot="icon-start"
            size="m"
            className="transition-transform duration-200"
          />
          {t('MainControls.CreateNewDict')}
        </GovButton>
      </div>
    </div>
  );
};
