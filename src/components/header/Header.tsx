'use client';

import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { normalizeBasePath } from '@/lib/basePath';
import { useEnvironment } from '../contexts/Environment';
import { SearchInput } from '../searchInput/SearchInput';
import { ThemeSwitch } from '../shared/ThemeSwitch';

import { HintSidebox } from './hintSidebox/HintSidebox';
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
  const callbackBasePath = normalizeBasePath(variables?.NEXT_PUBLIC_BASE_PATH);
  const callbackUrl = callbackBasePath === '' ? '/' : callbackBasePath;

  const isHomepage = pathname === '/';

  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleCloseMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="bg-footer-separator py-3 z-50 transition-colors duration-300">
        <section className="mx-auto max-w-full-hd px-5 flex justify-between items-center gap-x-4">
          {(!isHomepage || session) && (
            <>
              <div className="flex items-center gap-4">
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
            </>
          )}

          <nav className="ml-auto w-full">
            <ul className="hidden gap-x-3 px-3 w-full flex-col desktop:flex-row flex-nowrap items-center justify-end desktop:flex">
              {!isHomepage && <SearchInput />}
              {!isHomepage && !session && (
                <GovButton
                  type="solid"
                  color="secondary"
                  className="mx-2"
                  size="s"
                  onGovClick={() =>
                    signIn('keycloak', { prompt: 'login', callbackUrl })
                  }
                >
                  <GovIcon
                    type="components"
                    name="box-arrow-in-left"
                    slot="icon-end"
                    size="s"
                    className={`transition-transform duration-200`}
                  />
                  Přihlásit se přes CAAIS
                </GovButton>
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
              onGovClick={handleToggleMenu}
            >
              <GovIcon slot="icon-start" name="list" />
            </GovButton>
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
              <h1 className="text-3xl">
                ISMD – Informační systém pro modelování dat
              </h1>
            </div>
            <div className="flex flex-col items-center justify-center gap-y-8 p-5">
              <GovButton
                type="solid"
                color="secondary"
                size="l"
                className="[&>button]:px-20!"
                onGovClick={() =>
                  signIn('keycloak', { prompt: 'login', callbackUrl })
                }
              >
                <GovIcon
                  type="components"
                  name="box-arrow-in-left"
                  slot="icon-end"
                  className={`transition-transform duration-200`}
                />
                Přihlásit se přes CAAIS
              </GovButton>
            </div>
          </div>
        )}
      </header>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20"
          onClick={handleCloseMenu}
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
    </>
  );
};
