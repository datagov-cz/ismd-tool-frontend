'use client';

import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { useIsOnline } from '@/hooks/useIsOnline';

export const OnlineIndicator = () => {
  const t = useTranslations('Header.NavLogged');
  const isOnline = useIsOnline();

  const title = isOnline
    ? t('OnlineIndicator.Online')
    : t('OnlineIndicator.Offline');

  return (
    <div className="relative flex items-center group gap-x-2 bg-blue-subtle px-2 py-1 rounded-lg">
      <div className="relative flex items-center">
        <GovIcon
          name="cloud-check"
          size="2xl"
          aria-label={title}
          color="success"
          className={clsx(!isOnline && 'hidden!')}
        />
        <GovIcon
          name="cloud-slash"
          size="2xl"
          aria-label={title}
          color="error"
          className={clsx(isOnline && 'hidden!')}
        />
      </div>
      <span
        className={clsx(
          'font-bold text-sm',
          isOnline ? 'text-status-success' : 'text-status-error-700',
        )}
      >
        {title}
      </span>
    </div>
  );
};
