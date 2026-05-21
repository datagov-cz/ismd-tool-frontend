import { useTranslations } from 'next-intl';

import {
  ConceptDetailModelDefinice,
  ConceptDetailModelPopis,
} from '@/api/generated';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { Section } from '../Section';
import { IriRelatedTermList } from '../Term/IriRelatedTermList';

export const DefiningSection = ({
  definice,
  popis,
  ekvivalentniPojem,
  conceptType,
  nadrazenaTrida,
  pathname,
  source,
}: {
  definice?: ConceptDetailModelDefinice;
  popis?: ConceptDetailModelPopis;
  ekvivalentniPojem?: string[];
  conceptType?: 'TRIDA' | 'VLASTNOST' | 'VZTAH';
  nadrazenaTrida?: string[];
  pathname: string;
  source: 'ISMD' | 'NKD';
}) => {
  const t = useTranslations('ConceptDetail');

  const hasNadrazenaTrida =
    conceptType === 'TRIDA' && nadrazenaTrida && nadrazenaTrida.length > 0;

  if (!definice && !popis && !ekvivalentniPojem && !hasNadrazenaTrida) {
    return null;
  }
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
            pathname={pathname}
            source={source}
          />
        </Section>
      )}
      {ekvivalentniPojem && (
        <Section title={t('Sections.EquivalentConcept')}>
          <IriRelatedTermList
            iris={ekvivalentniPojem}
            pathname=""
            source="NKD"
          />
        </Section>
      )}
    </div>
  );
};
