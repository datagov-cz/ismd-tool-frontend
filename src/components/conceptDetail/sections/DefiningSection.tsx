import { useTranslations } from 'next-intl';

import {
  ConceptDetailModelDefinice,
  ConceptDetailModelPopis,
} from '@/api/generated';
import { ResolvedConceptsMap } from '@/utils/conceptRelations';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { Section } from '../Section';
import { IriRelatedTermList } from '../Term/IriRelatedTermList';

export const DefiningSection = ({
  definice,
  popis,
  ekvivalentniPojem,
  conceptType,
  nadrazenaTrida,
  source,
  resolved,
}: {
  definice?: ConceptDetailModelDefinice;
  popis?: ConceptDetailModelPopis;
  ekvivalentniPojem?: string[];
  conceptType?: 'TRIDA' | 'VLASTNOST' | 'VZTAH';
  nadrazenaTrida?: string[];
  source: 'ISMD' | 'NKD';
  resolved: ResolvedConceptsMap;
}) => {
  const t = useTranslations('ConceptDetail');

  const hasNadrazenaTrida =
    conceptType === 'TRIDA' && nadrazenaTrida && nadrazenaTrida.length > 0;

  if (!definice && !popis && !ekvivalentniPojem && !hasNadrazenaTrida) {
    return null;
  }
  console.log(nadrazenaTrida, 'test trida');
  return (
    <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
      {definice && (
        <Section title={t('Sections.Definition')}>
          <LanguageSwitcher item={definice} />
        </Section>
      )}
      {popis && (
        <Section title={t('Sections.Description')}>
          <LanguageSwitcher item={popis} />
        </Section>
      )}
      {hasNadrazenaTrida && (
        <Section title={t('Sections.SupersededClass')}>
          <IriRelatedTermList
            iris={nadrazenaTrida!}
            source={source}
            resolved={resolved}
          />
        </Section>
      )}
      {ekvivalentniPojem && (
        <Section title={t('Sections.EquivalentConcept')}>
          <IriRelatedTermList
            iris={ekvivalentniPojem}
            source="NKD"
            resolved={resolved}
          />
        </Section>
      )}
    </div>
  );
};
