import { useFormContext } from 'react-hook-form';

import { Input } from '@/components/shared/Input';
import { FormSection } from '../components/FormSection';
import { ConceptCreateModel } from '../schema/conceptFormSchema';

export const OntologySection = () => {
  const form = useFormContext<ConceptCreateModel>();
  return (
    <FormSection icon="database-gear" label="Technické údaje">
      <Input<ConceptCreateModel>
        register={form.register}
        label="Slovnik"
        name="ontologyGraphName"
        placeholder="zadejte iri slovniku"
        disabled
      />
      <Input<ConceptCreateModel>
        register={form.register}
        label="Adresa lokalniho katalogu dat"
        name="namespace"
        placeholder="zadejte iri slovniku"
        disabled
      />
    </FormSection>
  );
};
