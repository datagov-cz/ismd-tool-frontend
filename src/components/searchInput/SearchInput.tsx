'use client';

import {
  GovFormGroup,
  GovFormInput,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { SearchTypesPopover } from './SearchTypesPopover';

export const SearchInput = () => {
  const t = useTranslations('Home.MainControls');

  return (
    <div className="w-full max-w-150">
      <GovFormGroup className="relative">
        <GovFormInput placeholder={t('SearchPlaceholder')} size="l">
          <GovIcon
            type="components"
            color="neutral"
            name="search"
            slot="icon-start"
            size="s"
            className="transition-transform duration-200"
          />
        </GovFormInput>
        <SearchTypesPopover />
      </GovFormGroup>
    </div>
  );
};
