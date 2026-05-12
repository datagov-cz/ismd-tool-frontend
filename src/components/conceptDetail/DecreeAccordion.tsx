import { ReactNode } from 'react';
import { GovAccordionItem } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';
import { getMissingConceptFieldKeys } from '@/utils/getMissingConceptFields';
import { formatSharingMethodsFormate } from '../conceptCreate/conceptDataFormatter';
import { GridContainer } from '../dictionaryDetail/GridContainer';

import { ConceptDetailLink } from './ConceptDetailLink';

type Props = {
  conceptDetail: ConceptDetailModel;
  conceptType?: 'TRIDA' | 'VLASTNOST' | 'VZTAH';
};

export const DecreeAccordion = ({ conceptDetail, conceptType }: Props) => {
  const t = useTranslations('ConceptDetail.Decree');
  const missing = getMissingConceptFieldKeys(conceptDetail, conceptType);

  const showAcquire = !missing.has('způsob-získání-údaje');
  const showShare = !missing.has('způsob-sdílení-údaje');
  const showType = !missing.has('typ-obsahu-údaje');

  if (!showAcquire && !showShare && !showType) return null;

  return (
    <GovAccordionItem>
      <p className="font-medium! text-black! text-md!" slot="label">
        {t('Title')}
      </p>
      <div className="w-full flex flex-col gap-4">
        {showAcquire && (
          <AccordionItemContent title={t('Aquire')}>
            <ConceptDetailLink
              label={formatSharingMethodsFormate(
                conceptDetail['způsob-získání-údaje'],
              )}
              href={conceptDetail['způsob-získání-údaje'] || ''}
            />
          </AccordionItemContent>
        )}

        {showShare && (
          <AccordionItemContent title={t('Share')}>
            {conceptDetail['způsob-sdílení-údaje']?.map((item) => (
              <ConceptDetailLink
                key={item}
                label={formatSharingMethodsFormate(item)}
                href={item || ''}
              />
            ))}
          </AccordionItemContent>
        )}

        {showType && (
          <AccordionItemContent title={t('Type')}>
            <ConceptDetailLink
              label={formatSharingMethodsFormate(
                conceptDetail['typ-obsahu-údaje'],
              )}
              href={conceptDetail['typ-obsahu-údaje'] || ''}
            />
          </AccordionItemContent>
        )}
      </div>
    </GovAccordionItem>
  );
};

export const AccordionItemContent = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <GridContainer>
      <p className="font-medium! text-sm! col-span-2">{title}</p>
      <div className="col-span-3 flex flex-col gap-2">{children}</div>
    </GridContainer>
  );
};
