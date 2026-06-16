import { useTranslations } from 'next-intl';

import { NonLegislativeSourceInput } from '@/components/shared/NonLegislativeSourceInput';
import { LegislativeSourceInput } from '../../shared/LegislativeSourceInput/LegislativeSourceInput';
import { FormSection } from '../components/FormSection';

export const SourcesSection = () => {
  const t = useTranslations('ConceptDetail.Sections');

  return (
    <FormSection label={t('ConceptSource')} icon="book">
      <LegislativeSourceInput
        label="Definující ustanovení právního předpisu"
        name="a"
      />
      <LegislativeSourceInput
        label="Související ustanovení právního předpisu"
        name="b"
      />
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
