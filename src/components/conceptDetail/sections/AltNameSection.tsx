import { useTranslations } from 'next-intl';

import { ConceptDetailModelAlternativníNázev } from '@/api/generated';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { Section } from '../Section';

export const AltNameSection = ({
  altName,
}: {
  altName?: ConceptDetailModelAlternativníNázev;
}) => {
  const t = useTranslations('ConceptDetail');

  if (!altName) {
    return null;
  }
  return (
    <div className="bg-surface px-4 py-3 rounded-md shadow-subtle">
      <Section title={t('Sections.AlternativeName')}>
        <LanguageSwitcher item={altName} />
      </Section>
    </div>
  );
};
