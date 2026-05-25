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
      label: t('ClassCreateFields.Labels.ClassType'),
    },
    {
      value: ConceptEditModelConceptTypeEnum.VLASTNOST,
      label: t('PropertyCreateFields.Labels.Domain'),
    },
    {
      value: ConceptEditModelConceptTypeEnum.VZTAH,
      label: t('RelationshipConceptFields.Labels.Domain'),
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
    <FormSection icon="diagram-3" label={t('ClassCreateFields.Label')}>
      <Select
        name="conceptTypeEnum"
        label={t('ClassCreateFields.Labels.ConceptType')}
        options={CONCEPT_TYPE_OPTIONS}
        changeMultiple="conceptType"
      />
      {type === 'TRIDA' && (
        <Select
          name="type"
          label={t('ClassCreateFields.Labels.ClassType')}
          options={TYPE_OPTIONS}
        />
      )}
      {type === 'VLASTNOST' && (
        <>
          <ConceptInput
            name="domain"
            label={t('TypesSection.PropertyDomainLabel')}
            placeholder={t('TypesSection.PropertyDomainPlaceholder')}
            single
          />
          <Input<ConceptForm>
            name="dataType"
            placeholder={t('TypesSection.PropertyDataTypePlaceholder')}
            register={register}
            label={t('TypesSection.PropertyDataTypeLabel')}
          />
        </>
      )}
      {type === 'VZTAH' && (
        <>
          <ConceptInput
            name="domain"
            label={t('TypesSection.RelationDomainLabel')}
            placeholder={t('TypesSection.RelationDomainPlaceholder')}
            single
          />
          <ConceptInput
            name="range"
            label={t('TypesSection.RelationRangeLabel')}
            placeholder={t('TypesSection.RelationRangePlaceholder')}
            single
          />
        </>
      )}
    </FormSection>
  );
};
