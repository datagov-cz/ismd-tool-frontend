import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { Input } from '@/components/shared/Input';
import { FormSection } from '../components/FormSection';
import { ConceptCreateModel } from '../schema/conceptFormSchema';

export const OntologySection = () => {
  const form = useFormContext<ConceptCreateModel>();
  const t = useTranslations('CreateConcept.OntologySection');

  return (
    <FormSection icon="database-gear" label={t('Label')}>
      <Input<ConceptCreateModel>
        register={form.register}
        label={t('OntologyLabel')}
        name="ontologyGraphName"
        placeholder={t('OntologyPlaceholder')}
        disabled
      />
      <Input<ConceptCreateModel>
        register={form.register}
        label={t('NamespaceLabel')}
        name="namespace"
        placeholder={t('NamespacePlaceholder')}
        disabled
      />
    </FormSection>
  );
};
