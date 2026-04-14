'use client';

import { GovButton } from '@gov-design-system-ce/react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { useEnvironment } from '@/components/contexts/Environment';
import { normalizeBasePath } from '@/lib/basePath';

export const WelcomeSection = () => {
  const t = useTranslations('Home');
  const { variables } = useEnvironment();
  const callbackBasePath = normalizeBasePath(variables?.NEXT_PUBLIC_BASE_PATH);
  const callbackUrl = callbackBasePath === '' ? '/' : callbackBasePath;

  return (
    <div className="max-w-[780px] mx-auto flex flex-col items-center gap-y-6">
      <p className="text-center text-xl lg:text-2xl">
        {t('WelcomeSection.Description')}
      </p>
      <GovButton
        type="solid"
        size="l"
        color="primary"
        slot="button"
        onGovClick={() => signIn('keycloak', { prompt: 'login', callbackUrl })}
      >
        {t('LoginButton')}
      </GovButton>
      <h2 className="text-2xl lg:text-3xl font-bold">
        {t('WelcomeSection.Title')}
      </h2>
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Rem nihil
        dignissimos numquam. Doloremque, exercitationem natus.
      </p>
    </div>
  );
};
