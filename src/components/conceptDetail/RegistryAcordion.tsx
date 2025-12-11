import { GovAccordionItem, GovFormCheckbox } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';

import { ConceptDetailLink } from './ConceptDetailLink';
import { AccordionItemContent } from './DecreeAccordion';

type Props = {
  conceptDetail: ConceptDetailModel;
};

export const RegistryAccordion = ({ conceptDetail }: Props) => {
  const t = useTranslations('ConceptDetail.Registry');
  return (
    <GovAccordionItem>
      <p className="font-medium! text-black! text-md!" slot="label">
        {t('Title')}
      </p>
      <div className="w-full flex flex-col gap-4">
        <AccordionItemContent title="">
          <div className="flex items-center">
            <GovFormCheckbox checked={conceptDetail['je-ppdf']} />
            {t('PPDF')}
          </div>
        </AccordionItemContent>

        <AccordionItemContent title="">
          <div className="col-span-4 flex items-center">
            <GovFormCheckbox
              checked={!!conceptDetail['ustanovení-neveřejnost']}
            />
            {t('NonPublic')}
          </div>
        </AccordionItemContent>

        <AccordionItemContent title={t('AIS')}>
          <ConceptDetailLink
            label={conceptDetail['agendový-informační-systém']}
            href={conceptDetail.agenda || ''}
          />
        </AccordionItemContent>

        <AccordionItemContent title={t('Agenda')}>
          <ConceptDetailLink
            label={conceptDetail.agenda}
            href={conceptDetail.agenda || ''}
          />
        </AccordionItemContent>
      </div>
    </GovAccordionItem>
  );
};
