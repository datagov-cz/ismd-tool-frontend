'use client';

import { ReactNode } from 'react';
import { GovButton } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { Searchbox } from '@/components/shared/Searchbox';
import { SidebarContainer } from '@/components/shared/SidebarContainer';

interface Props {
  children: ReactNode;
}

const DictionaryDetailLayout = ({ children }: Props) => {
  const t = useTranslations('DictionaryDetail');

  return (
    <div className="w-full max-w-desktop mx-auto px-3 xl:px-0 py-6 flex gap-x-4 gap-y-8 flex-col lg:flex-row">
      <SidebarContainer>
        <div className="space-y-5">
          <div className="space-y-2">
            <Searchbox
              placeholder={t('Sidebar.SearchbarPlaceholder')}
              id="search-diagrams"
            />
            <div className="flex gap-2 flex-wrap">
              <GovButton type="solid" size="s" color="primary" slot="button">
                {t('Sidebar.DictTerms')}
              </GovButton>
              <GovButton type="solid" size="s" color="primary" slot="button">
                {t('Sidebar.AllResults')}
              </GovButton>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-lg">
              {t('Sidebar.DraftDictsHeadline')}
            </h3>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-lg">
              {t('Sidebar.PublishedDictsHeadline')}
            </h3>
          </div>
        </div>
      </SidebarContainer>
      {children}
    </div>
  );
};

export default DictionaryDetailLayout;
