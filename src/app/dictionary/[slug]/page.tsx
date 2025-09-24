import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { ControlPanel } from '@/components/dictionaryDetail/ControlPanel';
import { GridContainer } from '@/components/dictionaryDetail/GridContainer';
import { SidebarContainer } from '@/components/shared/SidebarContainer';

const DictionaryDetail = () => {
  const t = useTranslations('DictionaryDetail');

  const isDraft = true; // TODO: get real status from API

  return (
    <>
      <SidebarContainer>
        {/* TODO: Make custom Searchbar component */}
        <div className="flex items-center gap-2 border border-dark-border rounded-lg px-4 py-3.5 relative">
          <GovIcon name="search" size="m" slot="icon-start" className="z-[2]" />
          <label htmlFor="search-diagrams" className="hidden">
            {t('Sidebar.SearchbarPlaceholder')}
          </label>
          <input
            type="text"
            id="search-diagrams"
            className="w-full absolute top-0 left-0 h-full rounded-lg pl-10 pr-4 z-[1] outline-none text-sm"
            placeholder={t('Sidebar.SearchbarPlaceholder')}
          />
        </div>
      </SidebarContainer>
      <div className="w-full pl-2 pr-8 space-y-6 relative">
        <GridContainer>
          <div className="space-y-2 col-span-4 col-start-2">
            <h1 className="text-xl lg:text-3xl font-bold">Slovník 360/2023</h1>
            <p className="text-sm text-dark-secondary">
              {isDraft
                ? t('Main.DictionaryStatus.Draft')
                : t('Main.DictionaryStatus.Published')}
            </p>
          </div>
        </GridContainer>
        <GridContainer>
          <p className="font-medium text-xl">
            {t('Main.Sections.Description')}
          </p>
          <p className="col-span-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero id
            minima voluptate molestias quae omnis voluptatem consequuntur,
            exercitationem pariatur ipsa.
          </p>
          <p className="font-medium text-xl">
            {t('Main.Sections.RelatedResources')}
          </p>
          <p className="col-span-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione
            architecto autem asperiores molestias perspiciatis hic inventore
            consequuntur qui mollitia velit?
          </p>
        </GridContainer>
        <GridContainer>
          <p className="font-medium text-xl">{t('Main.Sections.Terms')}</p>
          <div className="col-span-4"></div>
        </GridContainer>
        <ControlPanel />
      </div>
    </>
  );
};

export default DictionaryDetail;
