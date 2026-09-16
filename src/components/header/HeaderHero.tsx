'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { IdpAlias, useNiaEnabled } from '@/hooks/useLogin';

import { LoginButton } from './LoginButton';

interface Props {
  onLogin: (_idp: IdpAlias) => void;
}

export const HeaderHero = ({ onLogin }: Props) => {
  const t = useTranslations('Header');
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const niaEnabled = useNiaEnabled();

  return (
    <div className="text-white w-full flex justify-center mt-4 desktop:mt-0 flex-col">
      <div className="flex items-center justify-center gap-8">
        <Image
          src={`${basePath}/assets/icon-pixel.svg`}
          width={60}
          height={80}
          alt="lion"
        />
        <h1 className="text-3xl">{t('LogoTitle')}</h1>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-6 p-5">
        <LoginButton
          size="l"
          idp="caais"
          className="[&>button]:px-20!"
          onLogin={onLogin}
        />
        {niaEnabled && (
          <LoginButton
            size="l"
            idp="nia"
            className="[&>button]:px-20!"
            onLogin={onLogin}
          />
        )}
      </div>
    </div>
  );
};
