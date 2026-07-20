import { useTranslations } from 'next-intl';

import { LanguageInput } from '@/components/shared/LanguageInput';
import { FormSection } from '../components/FormSection';
import { type ConceptForm } from '../schema/conceptFormSchema';

export const NamingSection = () => {
  const t = useTranslations('CreateConcept.NamingSection');

  return (
    <FormSection icon="tag" label={t('Label')}>
      <LanguageInput<ConceptForm>
        name="nameModel.name"
        label={t('NameLabel')}
        placeholder={t('NamePlaceholder')}
        anchor="name"
      />
      <LanguageInput<ConceptForm>
        name="altNameModel.altName"
        label={t('AltNameLabel')}
        placeholder={t('AltNamePlaceholder')}
        anchor="altName"
      />
    </FormSection>
  );
};
