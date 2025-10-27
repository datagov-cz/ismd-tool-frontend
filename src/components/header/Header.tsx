'use client';

import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { ThemeSwitch } from '../shared/ThemeSwitch';

import { HintSidebox } from './HintSidebox';
import { NavItems } from './NavItems';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations('Header');

  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleCloseMenu = () => setIsMenuOpen(false);

  const router = useRouter();

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
              <span className="hidden desktop:inline-block">
                {t('LogoTitle')}
              </span>
              <span className="inline-block desktop:hidden">
                {t('LogoTitleMobile')}
              </span>
            </Link>
            <Link href="/" className="items-center hidden desktop:flex">
              <GovIcon name="home" slot="icon-start" size="l" />
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={() => router.back()}>
                <GovIcon
                  className="cursor-pointer"
                  name="chevron-left"
                  size="l"
                />
              </button>
              <button onClick={() => router.forward()}>
                <GovIcon
                  className="cursor-pointer"
                  name="chevron-right"
                  size="l"
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <GovIcon name="undo" size="l" />
              <GovIcon name="redo" size="l" />
            </div>
          </div>
          <nav className="ml-auto">
            <ul className="hidden gap-x-4 px-3 flex-col desktop:flex-row flex-wrap items-center desktop:flex">
              <NavItems />
            </ul>
          </nav>
          <ul className="flex gap-x-4 items-center">
            <ThemeSwitch />
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
      <HintSidebox />
    </>
  );
};
