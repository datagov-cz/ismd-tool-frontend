import { useFormContext } from 'react-hook-form';

import { ConceptInput } from '@/components/shared/ConceptInput';
import { LanguageInput } from '@/components/shared/LanguageInput';
import { FormSection } from '../components/FormSection';
import { ConceptForm } from '../schema/conceptFormSchema';

export const ConceptMeaningSection = () => {
  const form = useFormContext();
  return (
    <FormSection icon="journal-text" label="Význam pojmu">
      <LanguageInput<ConceptForm>
        name="definitionModel.definition"
        label="Definice"
        placeholder="Definice"
      />
      <LanguageInput<ConceptForm>
        name="descriptionModel.description"
        label="Popis"
        placeholder="Popis"
      />
      {form.watch('conceptType') === 'TRIDA' && (
        <ConceptInput
          name="broaderConcept"
          label="Nadřazená třída"
          placeholder="Hledat"
        />
      )}
      {form.watch('conceptType') === 'VZTAH' && (
        <ConceptInput
          name="superRelation"
          label="Nadřazeny vztah"
          placeholder="Hledat"
        />
      )}
      {form.watch('conceptType') === 'VLASTNOST' && (
        <ConceptInput
          name="superProperty"
          label="Nadřazená vlastnost"
          placeholder="Hledat"
        />
      )}
      <ConceptInput
        name="exactMatch"
        label="Ekvivalnetní pojem"
        placeholder="Hledat"
      />
    </FormSection>
  );
};
