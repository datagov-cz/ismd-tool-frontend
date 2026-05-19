import { useFormContext } from 'react-hook-form';

import { Input } from '@/components/shared/Input';
import { LanguageInput } from '@/components/shared/LanguageInput';
import { FormSection } from '../components/FormSection';
import { type ConceptForm } from '../schema/conceptFormSchema';

export const NamingSection = () => {
  const form = useFormContext();
  return (
    <FormSection icon="tag" label="Pojmenování">
      <Input
        register={form.register}
        name="nameModel.name.cs"
        label="Název"
        placeholder="Zadejte název pojmu"
      />
      <LanguageInput<ConceptForm>
        name="altNameModel.altName"
        label="Alternativní název"
        placeholder="Zadejte název pojmu"
      />
    </FormSection>
  );
};
