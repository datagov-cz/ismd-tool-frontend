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
    <FormSection icon="journal-text" label={t('Label')} anchor="meaning">
      <LanguageInput<ConceptForm>
        name="definitionModel.definition"
        label={t('DefinitionLabel')}
        placeholder={t('DefinitionPlaceholder')}
        anchor="definition"
      />
      <LanguageInput<ConceptForm>
        name="descriptionModel.description"
        label={t('DescriptionLabel')}
        anchor="description"
        placeholder={t('DescriptionPlaceholder')}
      />
      {form.watch('conceptType') === 'TRIDA' && (
        <ConceptInput
          name="broaderConcept"
          anchor="broaderConcept"
          label={t('BroaderConceptLabel')}
          placeholder={t('SearchPlaceholder')}
          searchType="CLASS"
          searchSource="ALL"
        />
      )}
      {form.watch('conceptType') === 'VZTAH' && (
        <ConceptInput
          name="superRelation"
          anchor="superRelation"
          label={t('SuperRelationLabel')}
          placeholder={t('SearchPlaceholder')}
          searchType="RELATIONSHIP"
          searchSource="ALL"
          single
        />
      )}
      {form.watch('conceptType') === 'VLASTNOST' && (
        <ConceptInput
          name="superProperty"
          anchor="superProperty"
          label={t('SuperPropertyLabel')}
          placeholder={t('SearchPlaceholder')}
          searchType="PROPERTY"
          searchSource="ALL"
        />
      )}
      <ConceptInput
        name="exactMatch"
        anchor="exactMatch"
        label={t('EquivalentConceptLabel')}
        placeholder={t('SearchPlaceholder')}
        searchType="CONCEPT"
        searchSource="ALL"
      />
    </FormSection>
  );
};
