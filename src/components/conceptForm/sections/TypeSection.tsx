import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { ConceptEditModelConceptTypeEnum } from '@/api/generated';
import { ConceptInput } from '@/components/shared/ConceptInput';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import { FormSection } from '../components/FormSection';
import { type ConceptForm } from '../schema/conceptFormSchema';

export const TypesSection = () => {
  const { watch, register } = useFormContext<ConceptForm>();
  const type = watch('conceptType');
  const t = useTranslations('CreateConcept');

  const CONCEPT_TYPE_OPTIONS = [
    {
      value: ConceptEditModelConceptTypeEnum.TRIDA,
      label: t('CommonConceptFields.Options.Class'),
    },
    {
      value: ConceptEditModelConceptTypeEnum.VLASTNOST,
      label: t('CommonConceptFields.Options.Property'),
    },
    {
      value: ConceptEditModelConceptTypeEnum.VZTAH,
      label: t('CommonConceptFields.Options.Relation'),
    },
  ];

  const TYPE_OPTIONS = [
    { value: '', label: '' },
    {
      value: 'Objekt',
      label: t('ClassCreateFields.Options.ClassType.ObjectOfLawType'),
    },
    {
      value: 'Subjekt',
      label: t('ClassCreateFields.Options.ClassType.SubjectOfLawType'),
    },
  ];

  return (
    <FormSection
      icon="diagram-3"
      label={t('ClassCreateFields.Label')}
      anchor="types"
    >
      <Select
        name="conceptTypeEnum"
        anchor="conceptTypeEnum"
        label={t('ClassCreateFields.Labels.ConceptType')}
        options={CONCEPT_TYPE_OPTIONS}
        changeMultiple="conceptType"
      />
      {type === 'TRIDA' && (
        <Select
          name="type"
          anchor="type"
          label={t('ClassCreateFields.Labels.ClassType')}
          options={TYPE_OPTIONS}
        />
      )}
      {type === 'VLASTNOST' && (
        <>
          <ConceptInput
            name="domain"
            anchor="domain"
            label={t('TypesSection.PropertyDomainLabel')}
            placeholder={t('TypesSection.PropertyDomainPlaceholder')}
            searchSource="ALL"
            searchType="CONCEPT"
            single
          />
          <Input<ConceptForm>
            placeholder={t('TypesSection.PropertyDataTypePlaceholder')}
            name="dataType"
            anchor="dataType"
            register={register}
            label={t('TypesSection.PropertyDataTypeLabel')}
          />
        </>
      )}
      {type === 'VZTAH' && (
        <>
          <ConceptInput
            name="domain"
            anchor="domain"
            label={t('TypesSection.RelationDomainLabel')}
            placeholder={t('TypesSection.RelationDomainPlaceholder')}
            searchType="CONCEPT"
            searchSource="ALL"
            single
          />
          <ConceptInput
            name="range"
            anchor="range"
            label={t('TypesSection.RelationRangeLabel')}
            placeholder={t('TypesSection.RelationRangePlaceholder')}
            searchType="CONCEPT"
            searchSource="ALL"
            single
          />
        </>
      )}
    </FormSection>
  );
};
