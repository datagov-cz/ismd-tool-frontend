import {
  GovButton,
  GovFormControl,
  GovFormGroup,
  GovFormInput,
  GovFormSearch,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Home');

  return (
    <div className="w-full max-w-desktop mx-auto px-3 py-6">
      <div className="space-y-4 mx-auto">
        <div className="flex gap-4 flex-wrap justify-center mx-auto max-w-[780px]">
          <GovButton type="solid" size="l" color="primary" slot="button">
            {t('MainControls.OpenDictFromFile')}
          </GovButton>
          <GovButton type="solid" size="l" color="primary" slot="button">
            {t('MainControls.CreateNewDict')}
          </GovButton>
        </div>
        <GovFormControl className="w-full">
          <GovFormGroup>
            <GovFormSearch>
              <GovFormInput
                slot="input"
                placeholder="Vyberte slovník z Výrobní linky..."
              />
              <GovButton slot="button">
                <GovIcon name="search" slot="icon-start" />
              </GovButton>
            </GovFormSearch>
          </GovFormGroup>
        </GovFormControl>
      </div>
      <div className="h-[1px] my-8 bg-dark-border" />
      <div className="max-w-[780px] mx-auto flex flex-col items-center gap-y-6">
        <p className="text-center text-xl lg:text-2xl">
          {t('WelcomeSection.Description')}
        </p>
        <GovButton type="solid" size="l" color="primary" slot="button">
          {t('LoginButton')}
        </GovButton>
        <h2 className="text-2xl lg:text-3xl font-bold">
          {t('WelcomeSection.Title')}
        </h2>
        <p></p>
      </div>
    </div>
  );
}
