'use client';

import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { useIsOnline } from '@/hooks/useIsOnline';

export const OnlineIndicator = () => {
  const t = useTranslations('Header.NavLogged');
  const isOnline = useIsOnline();

  const title = isOnline
    ? t('OnlineIndicator.Online')
    : t('OnlineIndicator.Offline');

  return (
    <div className="relative flex items-center group">
      <GovIcon
        name="cloud"
        size="xl"
        aria-label={title}
        className={`${isOnline ? 'text-green' : 'text-gray'} transition-colors duration-150`}
      />

      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 -bottom-6 z-[2] w-max max-w-xs -translate-x-1/2 rounded bg-blue text-white text-xs py-1 px-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-150"
      >
        {title}
      </span>
    </div>
  );
};
