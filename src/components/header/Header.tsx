'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { normalizeBasePath } from '@/lib/basePath';
import { isGatedPath } from '@/lib/site-status';
import { useEnvironment } from '../contexts/Environment';
import { SearchInput } from '../searchInput/SearchInput';
import { ThemeSwitch } from '../shared/ThemeSwitch';

import { HintSidebox } from './hintSidebox/HintSidebox';
import { LoginButton } from './LoginButton';
import { MobileMenu } from './MobileMenu';
import { NavItems } from './NavItems';
import { OnlineIndicator } from './OnlineIndicator';

interface Props {
  session: Session | null;
  isGated?: boolean;
}

export const Header = ({ session, isGated: isGatedProp }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const t = useTranslations('Header');

  const searchToggleRef = useRef<HTMLGovButtonElement>(null);
  const restoreSearchFocus = useRef(false);

  const closeSearch = useCallback(() => {
    restoreSearchFocus.current = true;
    setIsSearchOpen(false);
  }, []);

  useEffect(() => {
    if (isSearchOpen || !restoreSearchFocus.current) return;

    restoreSearchFocus.current = false;
    void searchToggleRef.current?.getRef().then((element) => element.focus());
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchOpen, closeSearch]);

  useEffect(() => {
    const breakpoint = getComputedStyle(
      document.documentElement,
    ).getPropertyValue('--breakpoint-desktop');
    const mediaQuery = window.matchMedia(`(width >= ${breakpoint})`);

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsSearchOpen(false);
        setIsMenuOpen(false);
      }
    };

    const handleShortcut = (e: KeyboardEvent) => {
      if (e.key !== 'k' || (!e.ctrlKey && !e.metaKey) || mediaQuery.matches) {
        return;
      }

      e.preventDefault();
      setIsSearchOpen(true);
    };

    mediaQuery.addEventListener('change', handleChange);
    document.addEventListener('keydown', handleShortcut);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      document.removeEventListener('keydown', handleShortcut);
    };
  }, []);

  const pathname = usePathname();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const { variables } = useEnvironment();
  const callbackUrl =
    normalizeBasePath(variables?.NEXT_PUBLIC_BASE_PATH) || '/';

  const isHomepage = pathname === '/';
  const isAuthenticated = !!session;
  const showHeaderContent = isAuthenticated || !isHomepage;
  const isGated = isGatedProp ?? isGatedPath(pathname);

  const handleLogin = () => signIn('keycloak', { callbackUrl }, { prompt: 'login' });

  if (isGated) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 bg-footer-separator py-3 z-50">
          <section className="mx-auto max-w-full-hd px-5 flex items-center">
            <div className="flex items-center text-white font-medium gap-4">
              <Image
                src={`${basePath}/assets/icon-pixel.svg`}
                width={36}
                height={48}
                alt="lion"
              />
              <span className="text-xl">ISMD</span>
            </div>
          </section>
        </header>
        <div className="min-h-18" />
      </>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-footer-separator py-3 z-200 transition-colors duration-300">
        <section className="mx-auto max-w-full-hd px-5 min-h-12 flex justify-between items-center gap-x-2 desktop:gap-x-4">
          {isSearchOpen && <SearchInput autoFocus onClose={closeSearch} />}
          {showHeaderContent && !isSearchOpen && (
            <div className="flex items-center gap-2 desktop:gap-4 flex-1">
              <Link
                href="/"
                className="no-underline flex items-center text-white font-medium gap-4"
              >
                <Image
                  src={`${basePath}/assets/icon-pixel.svg`}
                  width={36}
                  height={48}
                  alt="lion"
                />
                <span className="text-xl">ISMD</span>
                {isAuthenticated && <OnlineIndicator />}
              </Link>
            </div>
          )}

          {showHeaderContent && !isSearchOpen && (
            <div className="flex-none desktop:flex-auto 2xl:flex-2 flex justify-center items-center gap-2 desktop:gap-4">
              {!isHomepage && (
                <GovButton
                  size="m"
                  type="solid"
                  color="primary"
                  className="max-desktop:hidden!"
                  href={`${process.env.NEXT_PUBLIC_BASE_PATH}/`}
                >
                  <GovIcon slot="icon-start" name="home" />
                </GovButton>
              )}
              <GovButton
                ref={searchToggleRef}
                size="m"
                type="solid"
                color="primary"
                className="desktop:hidden!"
                aria-expanded={isSearchOpen}
                onGovClick={() => setIsSearchOpen(true)}
              >
                <GovIcon
                  slot="icon-start"
                  type="components"
                  name="search"
                  size="s"
                />
                <span className="hidden tablet:inline">{t('Search')}</span>
              </GovButton>
              <SearchInput className="hidden desktop:block max-w-150" />
              {!isAuthenticated && !isHomepage && (
                <LoginButton
                  size="s"
                  className="max-desktop:order-first"
                  onLogin={handleLogin}
                />
              )}
              {isAuthenticated && (
                <GovButton
                  size="m"
                  type="solid"
                  color="primary"
                  className="max-desktop:hidden!"
                  href={`${process.env.NEXT_PUBLIC_BASE_PATH}/dictionary/create`}
                >
                  <GovIcon slot="icon-start" name="plus" />
                  {t('Ontology')}
                </GovButton>
              )}
            </div>
          )}
          <div
            className={clsx(
              'flex flex-none desktop:flex-1 justify-end items-center gap-x-2 desktop:gap-x-3',
              !isAuthenticated && 'ml-auto',
              isSearchOpen && 'hidden',
            )}
          >
            <nav className="hidden tablet:block">
              <ul className="hidden gap-x-2 desktop:gap-x-3 max-desktop:[--padding-x:0.75rem] max-desktop:[&_.element]:min-w-11! w-full flex-col tablet:flex-row flex-nowrap items-center justify-end tablet:flex">
                <NavItems session={session} />
              </ul>
            </nav>
            <div className="flex gap-x-2 desktop:gap-x-3 items-center">
              <div className="hidden tablet:flex items-center">
                <ThemeSwitch />
              </div>
              <GovButton
                size="m"
                type="solid"
                aria-label={t('MenuButtonAria')}
                color="primary"
                className="tablet:hidden!"
                onGovClick={() => setIsMenuOpen((prev) => !prev)}
              >
                <GovIcon slot="icon-start" type="components" name="list" />
              </GovButton>
            </div>
          </div>
        </section>

        {!session && isHomepage && (
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
              <LoginButton
                size="l"
                className="[&>button]:px-20!"
                onLogin={handleLogin}
              />
            </div>
          </div>
        )}
      </header>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-2000 tablet:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <MobileMenu
        isOpen={isMenuOpen}
        session={session}
        onClose={() => setIsMenuOpen(false)}
      />

      <HintSidebox />
      <div className={clsx(!session && isHomepage ? 'min-h-58' : 'min-h-18')} />
    </>
  );
};
