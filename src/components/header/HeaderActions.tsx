'use client';

import { RefObject } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { SearchInput } from '../searchInput/SearchInput';

import { LoginButton } from './LoginButton';
import { useHeaderButtonType } from './useHeaderButtonType';

interface Props {
  isAuthenticated: boolean;
  isHomepage: boolean;
  searchToggleRef: RefObject<HTMLButtonElement | null>;
  onOpenSearch: () => void;
  onLogin: () => void;
}

export const HeaderActions = ({
  isAuthenticated,
  isHomepage,
  searchToggleRef,
  onOpenSearch,
  onLogin,
}: Props) => {
  const t = useTranslations('Header');
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const buttonType = useHeaderButtonType();

  return (
    <div className="flex-none desktop:flex-auto 2xl:flex-2 flex justify-center items-center gap-2 desktop:gap-4">
      {!isHomepage && (
        <GovButton
          size="m"
          type={buttonType}
          color="primary"
          className="max-desktop:hidden!"
          href={`${basePath}/`}
          iconStart={<GovIcon name="home" />}
        ></GovButton>
      )}

      <GovButton
        ref={searchToggleRef}
        size="m"
        type={buttonType}
        color="primary"
        className="desktop:hidden!"
        onClick={onOpenSearch}
        iconStart={<GovIcon type="components" name="search" size="s" />}
      >
        <span className="hidden tablet:inline">{t('Search')}</span>
      </GovButton>

      <SearchInput className="hidden desktop:block max-w-150" />

      {!isAuthenticated && !isHomepage && (
        <LoginButton
          size="s"
          className="max-desktop:order-first"
          onLogin={onLogin}
        />
      )}

      {isAuthenticated && (
        <GovButton
          size="m"
          type={buttonType}
          color="primary"
          className="max-desktop:hidden!"
          href={`${basePath}/dictionary/create`}
          iconStart={<GovIcon name="plus" />}
        >
          {t('Ontology')}
        </GovButton>
      )}
    </div>
  );
};
