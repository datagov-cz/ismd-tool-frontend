import { useTranslations } from 'next-intl';

import { NonLegislativeSourceInput } from '@/components/shared/NonLegislativeSourceInput';
import { FormSection } from '../components/FormSection';

export const SourcesSection = () => {
  const t = useTranslations('ConceptDetail.Sections');
  return (
    <FormSection label={t('ConceptSource')} icon="book">
      <NonLegislativeSourceInput
        label={t('DefiningNonLegislative')}
        name="definingNonLegalSource"
      />
      <NonLegislativeSourceInput
        label={t('RelatedNonLeagislative')}
        name="relatedNonLegalSource"
      />
    </FormSection>
  );
};
