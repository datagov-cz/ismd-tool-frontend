'use client';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
import { signIn } from 'next-auth/react';

import { normalizeBasePath } from '@/lib/basePath';
import { isGatedPath } from '@/lib/site-status';
import { useEnvironment } from '../contexts/Environment';
import { SearchInput } from '../searchInput/SearchInput';

import { GatedHeader } from './GatedHeader';
import { HeaderActions } from './HeaderActions';
import { HeaderHero } from './HeaderHero';
import { HeaderLogo } from './HeaderLogo';
import { HeaderNav } from './HeaderNav';
import { HintSidebox } from './hintSidebox/HintSidebox';
import { MobileMenu } from './MobileMenu';
import { useHeaderSearch } from './useHeaderSearch';
import { useMobileMenu } from './useMobileMenu';

interface Props {
  session: Session | null;
  isGated?: boolean;
}

export const Header = ({ session, isGated: isGatedProp }: Props) => {
  const pathname = usePathname();
  const { variables } = useEnvironment();
  const callbackUrl =
    normalizeBasePath(variables?.NEXT_PUBLIC_BASE_PATH) || '/';

  const search = useHeaderSearch();
  const menu = useMobileMenu();

  const isHomepage = pathname === '/';
  const isAuthenticated = !!session;
  const showHero = !isAuthenticated && isHomepage;
  const showHeaderContent = isAuthenticated || !isHomepage;
  const isGated = isGatedProp ?? isGatedPath(pathname);

  const handleLogin = () =>
    signIn('keycloak', { callbackUrl }, { prompt: 'login' });

  if (isGated) {
    return <GatedHeader />;
  }

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 py-3 z-200 transition-colors duration-300',
          showHero ? 'bg-header-hero' : 'bg-header',
        )}
      >
        <section className="mx-auto max-w-full-hd px-5 min-h-12 flex justify-between items-center gap-x-2 desktop:gap-x-4">
          {search.isOpen && <SearchInput autoFocus onClose={search.close} />}

          {showHeaderContent && !search.isOpen && (
            <>
              <div className="flex items-center gap-2 desktop:gap-4 flex-1">
                <HeaderLogo showOnlineIndicator={isAuthenticated} />
              </div>

              <HeaderActions
                isAuthenticated={isAuthenticated}
                isHomepage={isHomepage}
                searchToggleRef={search.toggleRef}
                onOpenSearch={search.open}
                onLogin={handleLogin}
              />
            </>
          )}

          <HeaderNav
            session={session}
            isSearchOpen={search.isOpen}
            onToggleMenu={menu.toggle}
          />
        </section>

        {showHero && <HeaderHero onLogin={handleLogin} />}
      </header>

      {menu.isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-2000 tablet:hidden"
          onClick={menu.close}
        />
      )}

      <MobileMenu isOpen={menu.isOpen} session={session} onClose={menu.close} />

      <HintSidebox />
      <div
        className={!isAuthenticated && isHomepage ? 'min-h-58' : 'min-h-18'}
      />
    </>
  );
};
