import { GovAccordion } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';
import { ConceptDetailLink } from '@/components/conceptDetail/ConceptDetailLink';
import { ConceptHeader } from '@/components/conceptDetail/ConceptHeader';
import { DecreeAccordion } from '@/components/conceptDetail/DecreeAccordion';
import { LanguageSwitcher } from '@/components/conceptDetail/LanguageSwitcher';
import { LinkList } from '@/components/conceptDetail/LinkList';
import { RegistryAccordion } from '@/components/conceptDetail/RegistryAcordion';
import { Section } from '@/components/conceptDetail/Section';

interface Props {
  conceptDetail: ConceptDetailModel;
  ontology?: string;
  definicniObor?: { name: string; link: string } | null;
  children?: React.ReactNode;
}

export const ConceptLayout = ({
  conceptDetail,
  ontology = '',
  definicniObor,
  children,
}: Props) => {
  const t = useTranslations('ConceptDetail');

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
    <div className="w-full relative flex">
      <div className="w-full pl-2 pr-8 space-y-6 relative">
        <ConceptHeader
          ontology={ontology}
          conceptDetail={conceptDetail}
          definicniObor={definicniObor}
        />

        <Section title={t('Sections.AlternativeName')}>
          {conceptDetail['alternativní-název'] && (
            <LanguageSwitcher item={conceptDetail['alternativní-název']} />
          )}
        </Section>

        <Section title={t('Sections.Definition')}>
          {conceptDetail.definice && (
            <LanguageSwitcher item={conceptDetail.definice} />
          )}
        </Section>

        <Section title={t('Sections.Description')}>
          {conceptDetail.popis && (
            <LanguageSwitcher item={conceptDetail.popis} />
          )}
        </Section>

        <Section title="Ekvivalentni pojem">
          {conceptDetail['ekvivalentní-pojem']?.map((item) => (
            <ConceptDetailLink key={item} href={item || ''} />
          ))}
        </Section>

        <Section title={t('Sections.Resource')}>
          <LinkList
            items={conceptDetail['definující-ustanovení-právního-předpisu']}
          />
        </Section>

        <Section title={t('Sections.RelatedResources')}>
          <LinkList
            items={conceptDetail['související-ustanovení-právního-předpisu']}
          />
        </Section>

        <Section title={t('Sections.NonLegalResources')}>
          {renderNonLegalSource(
            conceptDetail['definující-nelegislativní-zdroj'],
          )}
        </Section>

        <Section title={t('Sections.RelatedNonLegalResources')}>
          {renderNonLegalSource(
            conceptDetail['související-nelegislativní-zdroj'],
          )}
        </Section>

        {/* ISMD-only: range, superclass/property/relation sections, etc. */}
        {children}

        <div className="w-full pt-10">
          <GovAccordion noBorder={false}>
            <RegistryAccordion conceptDetail={conceptDetail} />
            <DecreeAccordion conceptDetail={conceptDetail} />
          </GovAccordion>
        </div>
      </div>
    </div>
  );
};
