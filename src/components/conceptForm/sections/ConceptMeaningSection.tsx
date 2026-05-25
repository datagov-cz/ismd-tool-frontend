import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { ConceptInput } from '@/components/shared/ConceptInput';
import { LanguageInput } from '@/components/shared/LanguageInput';
import { FormSection } from '../components/FormSection';
import { ConceptForm } from '../schema/conceptFormSchema';

export const ConceptMeaningSection = () => {
  const form = useFormContext();
  const t = useTranslations('CreateConcept.ConceptMeaningSection');

  return (
    <FormSection icon="journal-text" label={t('Label')}>
      <LanguageInput<ConceptForm>
        name="definitionModel.definition"
        label={t('DefinitionLabel')}
        placeholder={t('DefinitionPlaceholder')}
      />
      <LanguageInput<ConceptForm>
        name="descriptionModel.description"
        label={t('DescriptionLabel')}
        placeholder={t('DescriptionPlaceholder')}
      />
      {form.watch('conceptType') === 'TRIDA' && (
        <ConceptInput
          name="broaderConcept"
          label={t('BroaderConceptLabel')}
          placeholder={t('SearchPlaceholder')}
        />
      )}
      {form.watch('conceptType') === 'VZTAH' && (
        <ConceptInput
          name="superRelation"
          label={t('SuperRelationLabel')}
          placeholder={t('SearchPlaceholder')}
        />
      )}
      {form.watch('conceptType') === 'VLASTNOST' && (
        <ConceptInput
          name="superProperty"
          label={t('SuperPropertyLabel')}
          placeholder={t('SearchPlaceholder')}
        />
      )}
      <ConceptInput
        name="exactMatch"
        label={t('EquivalentConceptLabel')}
        placeholder={t('SearchPlaceholder')}
      />
    </FormSection>
  );
};
