import { useTranslations } from 'next-intl';

import {
  ConceptDetailModelDefinice,
  ConceptDetailModelPopis,
} from '@/api/generated';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { RelatedTerm } from '../RelatedTerm';
import { Section } from '../Section';

export const DefiningSection = ({
  definice,
  popis,
  ekvivalentniPojem,
  conceptType,
  nadrazenaTrida,
  pathname,
}: {
  definice?: ConceptDetailModelDefinice;
  popis?: ConceptDetailModelPopis;
  ekvivalentniPojem?: string[];
  conceptType?: 'TRIDA' | 'VLASTNOST' | 'VZTAH';
  nadrazenaTrida?: string[];
  pathname: string;
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
          {nadrazenaTrida?.map((item) => (
            <RelatedTerm
              key={item}
              label={item.split('pojem/')[1]?.replace(/-/g, ' ') || ''}
              href={`${pathname.replace(/^\/|\/$/g, '')}-${item.split('/pojem/')[1]}`}
            />
          ))}
        </Section>
      )}
      {ekvivalentniPojem && (
        <Section title="Ekvivalentni pojem">
          {ekvivalentniPojem?.map((item) => (
            <RelatedTerm
              key={item}
              label={item.split('pojem/')[1]?.replace(/-/g, ' ') || ''}
              href={`/concept/nkd?iri=${item}`}
            />
          ))}
        </Section>
      )}
    </div>
  );
};
