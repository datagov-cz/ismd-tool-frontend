'use client';

import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { Session } from 'next-auth';
import { useTranslations } from 'next-intl';

import { useHintboxStore } from '@/store/hintboxStore';
import { federatedSignOut } from '@/utils/federatedSignOut';
import { ThemeSwitch } from '../shared/ThemeSwitch';

import { GITHUB_BASE } from './constants';

interface Props {
  isOpen: boolean;
  session: Session | null;
  onClose: () => void;
}

type MenuItem = {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
};

export const MobileMenu = ({ isOpen, session, onClose }: Props) => {
  const t = useTranslations('Header');
  const setIsHintboxOpen = useHintboxStore((state) => state.setIsOpen);

  const prefix = session ? 'NavLogged' : 'Nav';

  const items: MenuItem[] = [
    {
      icon: 'book',
      label: 'Dokumentace API',
      href: `${process.env.NEXT_PUBLIC_BASE_PATH}/swagger-ui/index.html`,
    },
    {
      icon: 'question-square',
      label: t(`${prefix}.Link1`),
      onClick: () => setIsHintboxOpen(true),
    },
    {
      icon: 'chat-dots',
      label: t(`${prefix}.Dropdown.Label`),
      href: GITHUB_BASE,
    },
  ];

  const accountItems: MenuItem[] = session
    ? [
        {
          icon: 'gear',
          label: t('NavLogged.Settings'),
          onClick: () => {},
        },
        {
          icon: 'upload',
          label: t('NavLogged.Logout'),
          onClick: () => void federatedSignOut(),
        },
      ]
    : [];

  const renderItem = ({ icon, label, href, onClick }: MenuItem) => (
    <li key={label}>
      <GovButton
        expanded
        type="base"
        color="primary"
        size="m"
        href={href}
        target={href ? '_blank' : undefined}
        className="no-underline [&_.element]:justify-start! [&_.element]:text-left!"
        onGovClick={() => {
          onClick?.();
          onClose();
        }}
      >
        <GovIcon type="components" name={icon} size="m" slot="icon-start" />
        {label}
      </GovButton>
    </li>
  );

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-3000 flex flex-col transform transition-all duration-300 ease-in-out tablet:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex items-center justify-between gap-2 p-4 border-b border-border-grey">
        {session && (
          <span className="flex items-center gap-2 font-medium">
            <GovIcon type="components" name="person" size="l" />
            {session.user?.name}
          </span>
        )}
        <GovButton
          type="base"
          color="neutral"
          size="s"
          className="ml-auto"
          aria-label={t('MenuCloseAria')}
          onGovClick={onClose}
        >
          <GovIcon type="components" name="x-lg" size="s" slot="icon-start" />
        </GovButton>
      </div>

      <nav>
        <ul className="flex flex-col p-2 gap-1">{items.map(renderItem)}</ul>
      </nav>

      <div className="mt-auto">
        {accountItems.length > 0 && (
          <ul className="flex flex-col p-2 gap-1 border-t border-border-grey">
            {accountItems.map(renderItem)}
          </ul>
        )}

        <div className="flex items-center justify-between gap-2 p-4 border-t border-border-grey">
          <span className="font-medium">{t('ThemeSwitchLabel')}</span>
          <ThemeSwitch />
        </div>
      </div>
    </aside>
  );
};
