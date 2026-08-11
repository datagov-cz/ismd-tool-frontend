'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { LoginButton } from './LoginButton';

interface Props {
  onLogin: () => void;
}

export const HeaderHero = ({ onLogin }: Props) => {
  const t = useTranslations('Header');
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

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
      <div className="flex flex-col items-center justify-center gap-y-8 p-5">
        <LoginButton size="l" className="[&>button]:px-20!" onLogin={onLogin} />
      </div>
    </div>
  );
};
