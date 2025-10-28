'use client';

import { useTranslations } from 'next-intl';

import { CommentSidebox } from '@/components/dictionaryDetail/CommentSidebox';
import { ControlPanel } from '@/components/dictionaryDetail/ControlPanel';
import { GridContainer } from '@/components/dictionaryDetail/GridContainer';

const DictionaryDetail = () => {
  const t = useTranslations('DictionaryDetail');

  const isDraft = true; // TODO: get real status from API

  return (
    <>
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
      <CommentSidebox />
    </>
  );
};

export default DictionaryDetail;
