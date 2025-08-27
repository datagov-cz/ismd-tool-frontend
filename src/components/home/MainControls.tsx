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
    </div>
  );
};
