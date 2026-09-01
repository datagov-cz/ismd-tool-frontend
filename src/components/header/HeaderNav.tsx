'use client';

import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { Session } from 'next-auth';
import { useTranslations } from 'next-intl';

import { ThemeSwitch } from '../shared/ThemeSwitch';

import { NavItems } from './NavItems';

interface Props {
  session: Session | null;
  isSearchOpen: boolean;
  onToggleMenu: () => void;
}

export const HeaderNav = ({ session, isSearchOpen, onToggleMenu }: Props) => {
  const t = useTranslations('Header');

  return (
    <div
      className={clsx(
        'flex flex-none desktop:flex-1 justify-end items-center gap-x-2 desktop:gap-x-3',
        !session && 'ml-auto',
        isSearchOpen && 'hidden',
      )}
    >
      <nav className="hidden tablet:block">
        <ul className="flex gap-x-2 desktop:gap-x-3 max-desktop:[--padding-x:0.75rem] max-desktop:[&_.element]:min-w-11! flex-nowrap items-center justify-end">
          <NavItems session={session} />
        </ul>
      </nav>

      <div className="hidden tablet:flex items-center">
        <ThemeSwitch />
      </div>

      <GovButton
        size="m"
        type="solid"
        aria-label={t('MenuButtonAria')}
        color="primary"
        className="tablet:hidden!"
        onClick={onToggleMenu}
      >
        <GovIcon slot="icon-start" type="components" name="list" />
      </GovButton>
    </div>
  );
};
