import { GovAccordion } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';
import { ConceptDetailLink } from '@/components/conceptDetail/ConceptDetailLink';
import { DecreeAccordion } from '@/components/conceptDetail/DecreeAccordion';
import { LanguageSwitcher } from '@/components/conceptDetail/LanguageSwitcher';
import { LinkList } from '@/components/conceptDetail/LinkList';
import { RegistryAccordion } from '@/components/conceptDetail/RegistryAcordion';
import { Section } from '@/components/conceptDetail/Section';
import { getMissingConceptFieldKeys } from '@/utils/getMissingConceptFields';

import { UdajeKDoplneni } from './UdajeKDoplneni';

interface Props {
  conceptDetail: ConceptDetailModel;
  ontology?: string;
  definicniObor?: { name: string; link: string } | null;
  conceptType?: 'TRIDA' | 'VLASTNOST' | 'VZTAH';
  children?: React.ReactNode;
}

export const ConceptLayout = ({
  conceptDetail,
  // ontology = '',
  // definicniObor,
  conceptType,
  children,
}: Props) => {
  const t = useTranslations('ConceptDetail');
  const missing = getMissingConceptFieldKeys(conceptDetail, conceptType);

  const renderNonLegalSource = (
    items: ConceptDetailModel['definující-nelegislativní-zdroj'],
  ) =>
    items?.map((item, index) =>
      'název' in item ? (
        <p key={index}>{item['název'].cs as string}</p>
      ) : 'url' in item ? (
        <ConceptDetailLink key={String(item.url)} href={String(item.url)} />
      ) : null,
    );

  return (
    <div className="w-full relative mx-auto max-w-250 grid grid-cols-10">
      <div className="w-full py-6 col-span-6 flex flex-col gap-2">
        {!missing.has('alternativní-název') && (
          <Section title={t('Sections.AlternativeName')}>
            <LanguageSwitcher item={conceptDetail['alternativní-název']!} />
          </Section>
        )}

        {!missing.has('definice') && (
          <Section title={t('Sections.Definition')}>
            <LanguageSwitcher item={conceptDetail.definice!} />
          </Section>
        )}

        {!missing.has('popis') && (
          <Section title={t('Sections.Description')}>
            <LanguageSwitcher item={conceptDetail.popis!} />
          </Section>
        )}

        {!missing.has('ekvivalentní-pojem') && (
          <Section title="Ekvivalentni pojem">
            {conceptDetail['ekvivalentní-pojem']?.map((item) => (
              <ConceptDetailLink key={item} href={item || ''} />
            ))}
          </Section>
        )}

        {!missing.has('definující-ustanovení-právního-předpisu') && (
          <Section title={t('Sections.Resource')}>
            <LinkList
              items={conceptDetail['definující-ustanovení-právního-předpisu']}
            />
          </Section>
        )}

        {!missing.has('související-ustanovení-právního-předpisu') && (
          <Section title={t('Sections.RelatedResources')}>
            <LinkList
              items={conceptDetail['související-ustanovení-právního-předpisu']}
            />
          </Section>
        )}

        {!missing.has('definující-nelegislativní-zdroj') && (
          <Section title={t('Sections.NonLegalResources')}>
            {renderNonLegalSource(
              conceptDetail['definující-nelegislativní-zdroj'],
            )}
          </Section>
        )}

        {!missing.has('související-nelegislativní-zdroj') && (
          <Section title={t('Sections.RelatedNonLegalResources')}>
            {renderNonLegalSource(
              conceptDetail['související-nelegislativní-zdroj'],
            )}
          </Section>
        )}

        {/* ISMD-only: range, superclass/property/relation sections, etc. */}
        {children}

        <div className="w-full bg-white rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] overflow-hidden">
          <GovAccordion noBorder={false}>
            <RegistryAccordion
              conceptDetail={conceptDetail}
              conceptType={conceptType}
            />
            <DecreeAccordion
              conceptDetail={conceptDetail}
              conceptType={conceptType}
            />
          </GovAccordion>
        </div>

        {/* Fields with no data, grouped for completion */}
        <UdajeKDoplneni
          conceptDetail={conceptDetail}
          conceptType={conceptType}
        />
      </div>
    </div>
  );
};
