import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';
import { Section } from '@/components/conceptDetail/Section';
import { useCurrentUser } from '../contexts/CurrentUserProvider';

import { ConceptRelation } from './ConceptRelation';
import { MissingConceptFields } from './MissingConceptFields';
import { RangeItem } from './RangeItem';
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
  slug: string;
  isOwnerLoggedIn?: boolean;
}

export const ConceptLayout = ({
  conceptDetail,
  conceptType,
  children,
  source,
  slug,
  isOwnerLoggedIn,
}: Props) => {
  const t = useTranslations('ConceptDetail');
  const { user } = useCurrentUser();
  const resolvedRelations = conceptDetail['referencované-pojmy-resolved'];
  return (
    <div className="w-full relative mx-auto max-w-250 grid grid-cols-10 items-start px-5">
      <div className="w-full py-6 col-span-6 flex flex-col gap-2">
        <AltNameSection altName={conceptDetail['alternativní-název']} />
        <DefiningSection
          conceptType={conceptType}
          definice={conceptDetail.definice}
          popis={conceptDetail.popis}
          ekvivalentniPojem={conceptDetail['ekvivalentní-pojem']}
          nadrazenaTrida={conceptDetail['nadřazená-třída']}
          resolved={resolvedRelations}
        />

        {conceptType === 'TRIDA' && conceptDetail.iri && (
          <PropertiesRelationsSection
            properties={conceptDetail.conceptProperties}
            relationships={conceptDetail.conceptRelationships}
            iri={conceptDetail.iri || ''}
            conceptName={conceptDetail['název']?.cs}
            slug={slug}
            isOwnerLoggedIn={isOwnerLoggedIn}
            resolvedRelations={resolvedRelations}
          />
        )}

        {conceptType !== 'TRIDA' &&
          (conceptDetail['definiční-obor'] || conceptDetail['obor-hodnot']) && (
            <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
              {conceptDetail['definiční-obor'] && (
                <ConceptRelation
                  title={t('Sections.DefinicniObor')}
                  iri={conceptDetail['definiční-obor']}
                  resolvedRelations={resolvedRelations}
                />
              )}
              {conceptDetail['obor-hodnot-resolved'] ? (
                <RangeItem
                  title={t('Sections.Range')}
                  item={conceptDetail['obor-hodnot-resolved']}
                />
              ) : conceptDetail['obor-hodnot'] ? (
                <ConceptRelation
                  title={t('Sections.Range')}
                  iri={conceptDetail['obor-hodnot']}
                  resolvedRelations={resolvedRelations}
                />
              ) : undefined}
            </div>
          )}

        {conceptType === 'VLASTNOST' &&
          conceptDetail['nadřazená-vlastnost'] && (
            <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
              <Section title={t('Sections.SupersededProperty')}>
                <SuperClassList
                  items={conceptDetail['nadřazená-vlastnost']}
                  resolved={resolvedRelations}
                />
              </Section>
            </div>
          )}

        {conceptType === 'VZTAH' && conceptDetail['nadřazený-vztah'] && (
          <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
            <Section title={t('Sections.SupersededRelation')}>
              <SuperClassList
                items={conceptDetail['nadřazený-vztah']}
                resolved={resolvedRelations}
              />
            </Section>
          </div>
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
          ppdf={conceptDetail['je-ppdf']}
          agenda={conceptDetail['agenda-resolved'] ?? conceptDetail.agenda}
          agendovyInformacniSystem={
            conceptDetail['agendový-informační-systém-resolved'] ??
            conceptDetail['agendový-informační-systém']
          }
          neverejnostUdaje={
            conceptDetail['ustanovení-dokládající-neveřejnost-údaje-resolved']
          }
        />

        <SharingTypeSection
          typObsahuUdaje={conceptDetail['typ-obsahu-údaje']}
          zpusobSdileniUdaje={conceptDetail['způsob-sdílení-údaje']}
          zpusobZiskaniUdaje={conceptDetail['způsob-získání-údaje']}
        />

        {source === 'ISMD' && user?.userId && (
          <MissingConceptFields
            slug={slug}
            conceptDetail={conceptDetail}
            conceptType={conceptType}
          />
        )}
      </div>
      <div className="w-full pl-10 col-span-4">{children}</div>
    </div>
  );
};
