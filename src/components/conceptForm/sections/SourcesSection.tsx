import { NonLegislativeSourceInput } from '@/components/shared/NonLegislativeSourceInput';
import { FormSection } from '../components/FormSection';

export const SourcesSection = () => {
  return (
    <FormSection label="Zdroje pojmu" icon="book">
      <NonLegislativeSourceInput
        label="Definujice nelegislativni zdroj"
        name="definingNonLegalSource"
      />
      <NonLegislativeSourceInput
        label="Souvisejici nelegislativni zdroj"
        name="relatedNonLegalSource"
      />
    </FormSection>
  );
};
