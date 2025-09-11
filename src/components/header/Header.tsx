'use client';

import { useState } from 'react';
import {
  GovButton,
  GovIcon,
  GovThemeSwitch,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { NavItems } from './NavItems';
import Link from 'next/link';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations('Header');

  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleCloseMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="bg-white py-3 z-50 transition-colors duration-300">
        <section className="mx-auto max-w-desktop px-5 flex justify-between items-center gap-x-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="h-12 no-underline flex items-center text-blue-primary font-medium gap-2"
            >
              <GovIcon
                name="logo-lion"
                slot="icon-start"
                className="!size-10"
              />
              {t('LogoTitle')}
            </Link>
            <Link href="/" className="flex items-center">
              <GovIcon name="house-door-fill" slot="icon-start" size="l" />
            </Link>
          </div>
          <nav className="ml-auto">
            <ul className="hidden gap-x-4 px-3 flex-col lg:flex-row flex-wrap items-center desktop:flex">
              <NavItems />
            </ul>
          </nav>
          <ul className="flex gap-x-4">
            <GovThemeSwitch />
            <GovButton
              size="m"
              type="outlined"
              aria-label={t('MenuButtonAria')}
              color="primary"
              className="desktop:!hidden"
              onGovClick={handleToggleMenu}
            >
              <GovIcon slot="icon-start" name="list" />
            </GovButton>
          </ul>
        </section>
      </header>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20"
          onClick={handleCloseMenu}
        />
      )}

      <aside
        className={`fixed top-[72px] left-0 h-full w-64 bg-white shadow-lg z-30 transform transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } desktop:hidden`}
      >
        <nav>
          <ul className="flex flex-col p-4 gap-3">
            <NavItems />
          </ul>
        </nav>
      </aside>
    </>
  );
};
