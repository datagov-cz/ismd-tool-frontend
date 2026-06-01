import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { Input } from '@/components/shared/Input';
import { LanguageInput } from '@/components/shared/LanguageInput';
import { FormSection } from '../components/FormSection';
import { type ConceptForm } from '../schema/conceptFormSchema';

export const NamingSection = () => {
  const form = useFormContext();
  const t = useTranslations('CreateConcept.NamingSection');

  return (
    <FormSection icon="tag" label={t('Label')} anchor="naming">
      <Input
        register={form.register}
        name="nameModel.name.cs"
        label={t('NameLabel')}
        placeholder={t('NamePlaceholder')}
        required
      />
      <LanguageInput<ConceptForm>
        name="altNameModel.altName"
        label={t('AltNameLabel')}
        placeholder={t('AltNamePlaceholder')}
      />
    </FormSection>
  );
};
