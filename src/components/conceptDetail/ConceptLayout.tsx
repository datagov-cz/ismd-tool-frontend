import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';
import { Section } from '@/components/conceptDetail/Section';
import { getMissingConceptFieldKeys } from '@/utils/getMissingConceptFields';

import { AddPropertyRelation } from './AddPropertyRelation';
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
  const missing = getMissingConceptFieldKeys(conceptDetail, conceptType);
  return (
    <div className="w-full relative mx-auto max-w-250 grid grid-cols-10">
      <div className="w-full py-6 col-span-6 flex flex-col gap-2">
        <DefiningSection
          conceptType={conceptType}
          definice={
            !missing.has('definice') ? conceptDetail.definice : undefined
          }
          popis={!missing.has('popis') ? conceptDetail.popis : undefined}
          ekvivalentniPojem={
            !missing.has('ekvivalentní-pojem')
              ? conceptDetail['ekvivalentní-pojem']
              : undefined
          }
          nadrazenaTrida={
            conceptDetail['nadřazená-třída'] &&
            conceptDetail['nadřazená-třída']?.length > 0
              ? conceptDetail['nadřazená-třída']
              : undefined
          }
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

        {conceptType === 'VLASTNOST' && (
          <Section title={t('Sections.SupersededProperty')}>
            <SuperClassList
              items={conceptDetail['nadřazená-vlastnost']}
              pathname={pathname}
            />
          </Section>
        )}

        {conceptType === 'VZTAH' && (
          <Section title={t('Sections.SupersededRelation')}>
            <SuperClassList
              items={conceptDetail['nadřazený-vztah']}
              pathname={pathname}
            />
          </Section>
        )}

        <LegalSection
          definujiciUstanoveni={
            conceptDetail['definující-ustanovení-právního-předpisu']
          }
          souvisejiciUstanoveni={
            conceptDetail['související-ustanovení-právního-předpisu']
          }
          definujícíZdroj={conceptDetail['definující-nelegislativní-zdroj']}
          souvisejícíZdroj={conceptDetail['související-nelegislativní-zdroj']}
        />

        {/* ISMD-only: range, superclass/property/relation sections, etc. */}
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
