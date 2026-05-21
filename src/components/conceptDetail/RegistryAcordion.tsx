import { GovAccordionItem } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';
import { getMissingConceptFieldKeys } from '@/utils/getMissingConceptFields';

import { ConceptDetailLink } from './ConceptDetailLink';
import { AccordionItemContent } from './DecreeAccordion';
import { Section } from './Section';

type Props = {
  conceptDetail: ConceptDetailModel;
  conceptType?: 'TRIDA' | 'VLASTNOST' | 'VZTAH';
};

export const RegistryAccordion = ({ conceptDetail, conceptType }: Props) => {
  const t = useTranslations('ConceptDetail.Registry');
  const tShared = useTranslations('Shared');
  const missing = getMissingConceptFieldKeys(conceptDetail, conceptType);

  const showPpdf = !missing.has('je-ppdf');
  const showAis = !missing.has('agendový-informační-systém');
  const showAgenda = !missing.has('agenda');
  // 'typ' is not in FIELD_GROUPS so we check it directly
  const showPublic =
    conceptDetail['typ'] !== undefined && conceptDetail['typ'].length > 0;

  if (!showPpdf && !showAis && !showAgenda && !showPublic) return null;

  return (
    <GovAccordionItem>
      <p className="font-medium! text-black! text-sm!" slot="label">
        {t('Title')}
      </p>
      <div className="w-full flex flex-col gap-4">
        {showPpdf && (
          <AccordionItemContent title="">
            <Section title={t('PPDF')}>
              {conceptDetail['je-ppdf'] ? tShared('Yes') : tShared('No')}
            </Section>
          </AccordionItemContent>
        )}

        {showPublic && (
          <AccordionItemContent title={t('NonPublic')}>
            {conceptDetail['typ']?.includes('Veřejný údaj')
              ? tShared('Yes')
              : tShared('No')}
          </AccordionItemContent>
        )}

        {showAis && (
          <AccordionItemContent title={t('AIS')}>
            <ConceptDetailLink
              label={conceptDetail['agendový-informační-systém']}
              href={conceptDetail['agendový-informační-systém'] || ''}
            />
          </AccordionItemContent>
        )}

        {showAgenda && (
          <AccordionItemContent title={t('Agenda')}>
            <ConceptDetailLink
              label={conceptDetail.agenda}
              href={conceptDetail.agenda || ''}
            />
          </AccordionItemContent>
        )}
      </div>
    </GovAccordionItem>
  );
};
