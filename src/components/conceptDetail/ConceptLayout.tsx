import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';
import { Section } from '@/components/conceptDetail/Section';

import { AddPropertyRelation } from './AddPropertyRelation';
import { ConceptRelation } from './ConceptRelation';
import { AgendaSection } from './sections/AgendaSection';
import { DefiningSection } from './sections/DefiningSection';
import { LegalSection } from './sections/LegalSection';
import { SuperClassList } from './SuperClassList';
import { UdajeKDoplneni } from './UdajeKDoplneni';

interface Props {
  conceptDetail: ConceptDetailModel;
  ontology?: string;
  definicniObor?: { name: string; link: string } | null;
  conceptType?: 'TRIDA' | 'VLASTNOST' | 'VZTAH';
  children?: React.ReactNode;
  pathname: string;
}

export const ConceptLayout = ({
  conceptDetail,
  // ontology = '',
  // definicniObor,
  conceptType,
  pathname,
  children,
}: Props) => {
  const t = useTranslations('ConceptDetail');
  return (
    <div className="w-full relative mx-auto max-w-250 grid grid-cols-10">
      <div className="w-full py-6 col-span-6 flex flex-col gap-2">
        <DefiningSection
          conceptType={conceptType}
          definice={conceptDetail.definice}
          popis={conceptDetail.popis}
          ekvivalentniPojem={conceptDetail['ekvivalentní-pojem']}
          nadrazenaTrida={conceptDetail['nadřazená-třída']}
          pathname={pathname}
        />

        {conceptType === 'TRIDA' &&
          ((conceptDetail.conceptProperties &&
            conceptDetail.conceptProperties?.length > 0) ||
            (conceptDetail.conceptRelationships &&
              conceptDetail.conceptRelationships?.length > 0)) && (
            <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
              {conceptDetail.conceptProperties &&
                conceptDetail.conceptProperties?.length > 0 && (
                  <AddPropertyRelation
                    title={t('Sections.Properties')}
                    concepts={conceptDetail.conceptProperties || []}
                  />
                )}
              {conceptDetail.conceptRelationships &&
                conceptDetail.conceptRelationships?.length > 0 && (
                  <AddPropertyRelation
                    concepts={conceptDetail.conceptRelationships || []}
                    title={t('Sections.Relations')}
                  />
                )}
            </div>
          )}
        {conceptType !== 'TRIDA' &&
          (conceptDetail['definiční-obor'] || conceptDetail['obor-hodnot']) && (
            <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
              {conceptDetail['definiční-obor'] && (
                <ConceptRelation
                  title={t('Sections.DefinicniObor')}
                  source={conceptDetail['definiční-obor']}
                  pathname={pathname}
                />
              )}
              {conceptDetail['obor-hodnot'] && (
                <ConceptRelation
                  source={conceptDetail['obor-hodnot']}
                  title={t('Sections.Range')}
                  pathname={pathname}
                />
              )}
            </div>
          )}

        {conceptType === 'VLASTNOST' &&
          conceptDetail['nadřazená-vlastnost'] && (
            <Section title={t('Sections.SupersededProperty')}>
              <SuperClassList
                items={conceptDetail['nadřazená-vlastnost']}
                pathname={pathname}
              />
            </Section>
          )}

        {conceptType === 'VZTAH' && conceptDetail['nadřazený-vztah'] && (
          <Section title={t('Sections.SupersededRelation')}>
            <SuperClassList
              items={conceptDetail['nadřazený-vztah']}
              pathname={pathname}
            />
          </Section>
        )}
        <LegalSection
          definujiciUstanoveni={
            conceptDetail['definující-ustanovení-právního-předpisu-resolved']
          }
          souvisejiciUstanoveni={
            conceptDetail['související-ustanovení-právního-předpisu-resolved']
          }
          definujícíZdroj={conceptDetail['definující-nelegislativní-zdroj']}
          souvisejícíZdroj={conceptDetail['související-nelegislativní-zdroj']}
        />

        {/* ISMD-only: range, superclass/property/relation sections, etc. */}

        <AgendaSection
          agenda={conceptDetail['agenda-resolved']}
          agendovyInformacniSystem={
            conceptDetail['agendový-informační-systém-resolved']
          }
          neverejnostUdaje={
            conceptDetail['ustanovení-dokládající-neveřejnost-údaje']
          }
        />
        {children}

        {/* Fields with no data, grouped for completion */}
        <UdajeKDoplneni
          conceptDetail={conceptDetail}
          conceptType={conceptType}
        />
      </div>
    </div>
  );
};
