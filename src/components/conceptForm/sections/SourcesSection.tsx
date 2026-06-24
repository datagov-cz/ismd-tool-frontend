import { useTranslations } from 'next-intl';

import { NonLegislativeSourceInput } from '@/components/shared/NonLegislativeSourceInput';
import { LegislativeSourceArrayInput } from '../../shared/LegislativeSourceInput/LegislativeSourceArrayInput';
import { FormSection } from '../components/FormSection';
import { type ConceptForm } from '../schema/conceptFormSchema';

export const SourcesSection = () => {
  const t = useTranslations('ConceptDetail.Sections');

  return (
    <FormSection label={t('ConceptSource')} icon="book">
      <LegislativeSourceArrayInput<ConceptForm>
        label="Definující ustanovení právního předpisu"
        name="definingLegalSource"
        anchor="definingLegalSource"
      />
      <LegislativeSourceArrayInput<ConceptForm>
        label="Související ustanovení právního předpisu"
        name="relatedLegalSource"
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
