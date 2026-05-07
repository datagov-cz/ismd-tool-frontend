'use client';

import { useState } from 'react';
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
import { NavItems } from './NavItems';

interface Props {
  session: Session | null;
}

export const Header = ({ session }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations('Header');

  const pathname = usePathname();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const { variables } = useEnvironment();
  const callbackUrl =
    normalizeBasePath(variables?.NEXT_PUBLIC_BASE_PATH) || '/';

  const isHomepage = pathname === '/';
  const showFullHeader = !isHomepage || !!session;
  const isGated = isGatedPath(pathname);

  const handleLogin = () =>
    signIn('keycloak', { prompt: 'login', callbackUrl });

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
      <header className="fixed top-0 left-0 right-0 bg-footer-separator py-3 z-50 transition-colors duration-300">
        <section className="mx-auto max-w-full-hd px-5 flex justify-between items-center gap-x-4">
          {showFullHeader && (
            <div className="flex items-center gap-4 flex-1">
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
                <span className="hidden desktop:inline-block text-xl">
                  ISMD
                </span>
                <span className="inline-block desktop:hidden">
                  {t('LogoTitleMobile')}
                </span>
              </Link>
            </div>
          )}

          {showFullHeader && (
            <div className="flex-2 2xl:flex-2 flex justify-center items-center gap-4">
              {!isHomepage && (
                <GovButton
                  size="m"
                  type="solid"
                  color="primary"
                  href={`${process.env.NEXT_PUBLIC_BASE_PATH}/`}
                >
                  <GovIcon slot="icon-start" name="home" />
                </GovButton>
              )}
              <SearchInput />
              {session && (
                <GovButton
                  size="m"
                  type="solid"
                  color="primary"
                  href={`${process.env.NEXT_PUBLIC_BASE_PATH}/dictionary/create`}
                >
                  <GovIcon slot="icon-start" name="plus" />
                  {t('Ontology')}
                </GovButton>
              )}
            </div>
          )}

          <div className="flex flex-1 justify-end">
            <nav>
              <ul className="hidden gap-x-3 px-3 w-full flex-col desktop:flex-row flex-nowrap items-center justify-end desktop:flex">
                {!isHomepage && !session && (
                  <LoginButton
                    size="s"
                    className="mx-2"
                    onLogin={handleLogin}
                  />
                )}
                <NavItems session={session} />
              </ul>
            </nav>
            <div className="flex gap-x-4 items-center">
              <ThemeSwitch />
              <GovButton
                size="m"
                type="outlined"
                aria-label={t('MenuButtonAria')}
                color="primary"
                className="desktop:hidden!"
                onGovClick={() => setIsMenuOpen((prev) => !prev)}
              >
                <GovIcon slot="icon-start" name="list" />
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
          className="fixed inset-0 bg-black/40 z-20"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-18 left-0 h-full w-64 bg-white shadow-lg z-30 transform transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } desktop:hidden`}
      >
        <nav>
          <ul className="flex flex-col p-4 gap-3">
            <NavItems session={session} />
          </ul>
        </nav>
      </aside>

      <HintSidebox />
      <div className={clsx(!session && isHomepage ? 'min-h-58' : 'min-h-18')} />
    </>
  );
};
