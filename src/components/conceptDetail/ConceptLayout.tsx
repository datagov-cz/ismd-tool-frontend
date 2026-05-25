import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';
import { Section } from '@/components/conceptDetail/Section';
import { ResolvedConceptsMap } from '@/utils/conceptRelations';

import { ConceptRelation } from './ConceptRelation';
import { MissingConceptFields } from './MissingConceptFields';
import { AgendaSection } from './sections/AgendaSection';
import { AltNameSection } from './sections/AltNameSection';
import { DefiningSection } from './sections/DefiningSection';
import { LegalSection } from './sections/LegalSection';
import { PropertiesRelationsSection } from './sections/PropertiesRelationsSection';
import { SharingTypeSection } from './sections/SharingTypeSection';
import { SuperClassList } from './SuperClassList';

interface Props {
  conceptDetail: ConceptDetailModel;
  conceptType?: 'TRIDA' | 'VLASTNOST' | 'VZTAH';
  children?: React.ReactNode;
  source: 'NKD' | 'ISMD';
  resolvedRelations: ResolvedConceptsMap;
}

export const ConceptLayout = ({
  conceptDetail,
  conceptType,
  children,
  source,
  resolvedRelations,
}: Props) => {
  const t = useTranslations('ConceptDetail');
  return (
    <div className="w-full relative mx-auto max-w-250 grid grid-cols-10 items-start">
      <div className="w-full py-6 col-span-6 flex flex-col gap-2">
        <AltNameSection altName={conceptDetail['alternativní-název']} />
        <DefiningSection
          conceptType={conceptType}
          definice={conceptDetail.definice}
          popis={conceptDetail.popis}
          ekvivalentniPojem={conceptDetail['ekvivalentní-pojem']}
          nadrazenaTrida={conceptDetail['nadřazená-třída']}
          source={source}
          resolved={resolvedRelations}
        />

        {conceptType === 'TRIDA' && (
          <PropertiesRelationsSection
            properties={conceptDetail.conceptProperties}
            relationships={conceptDetail.conceptRelationships}
          />
        )}

        {conceptType !== 'TRIDA' &&
          (conceptDetail['definiční-obor'] || conceptDetail['obor-hodnot']) && (
            <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
              {conceptDetail['definiční-obor'] && (
                <ConceptRelation
                  source={source}
                  title={t('Sections.DefinicniObor')}
                  iri={conceptDetail['definiční-obor']}
                  resolvedRelations={resolvedRelations}
                />
              )}
              {conceptDetail['obor-hodnot'] && (
                <ConceptRelation
                  source={source}
                  iri={conceptDetail['obor-hodnot']}
                  title={t('Sections.Range')}
                  resolvedRelations={resolvedRelations}
                />
              )}
            </div>
          )}

        {conceptType === 'VLASTNOST' &&
          conceptDetail['nadřazená-vlastnost'] && (
            <Section title={t('Sections.SupersededProperty')}>
              <SuperClassList
                items={conceptDetail['nadřazená-vlastnost']}
                source={source}
                resolved={resolvedRelations}
              />
            </Section>
          )}

        {conceptType === 'VZTAH' && conceptDetail['nadřazený-vztah'] && (
          <Section title={t('Sections.SupersededRelation')}>
            <SuperClassList
              items={conceptDetail['nadřazený-vztah']}
              source={source}
              resolved={resolvedRelations}
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

        <AgendaSection
          agenda={conceptDetail['agenda-resolved'] ?? conceptDetail.agenda}
          agendovyInformacniSystem={
            conceptDetail['agendový-informační-systém-resolved'] ??
            conceptDetail['agendový-informační-systém']
          }
          neverejnostUdaje={
            conceptDetail['ustanovení-dokládající-neveřejnost-údaje']
          }
        />

        <SharingTypeSection
          typObsahuUdaje={conceptDetail['typ-obsahu-údaje']}
          zpusobSdileniUdaje={conceptDetail['způsob-sdílení-údaje']}
          zpusobZiskaniUdaje={conceptDetail['způsob-získání-údaje']}
        />

        {source === 'ISMD' && (
          <MissingConceptFields
            conceptDetail={conceptDetail}
            conceptType={conceptType}
          />
        )}
      </div>
      <div className="w-full pl-10 col-span-4">{children}</div>
    </div>
  );
};
