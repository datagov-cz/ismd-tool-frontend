import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { ConceptEditModelConceptTypeEnum } from '@/api/generated';
import { ConceptInput } from '@/components/shared/ConceptInput';
import { DataTypeInput } from '@/components/shared/DataTypeInput';
import { Select } from '@/components/shared/Select';
import { FormSection } from '../components/FormSection';
import { type ConceptForm } from '../schema/conceptFormSchema';

export const TypesSection = ({ editing }: { editing?: boolean }) => {
  const { watch } = useFormContext<ConceptForm>();
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
    <FormSection icon="diagram-3" label={t('ClassCreateFields.Label')}>
      <Select
        name="conceptTypeEnum"
        anchor="conceptTypeEnum"
        label={t('ClassCreateFields.Labels.ConceptType')}
        options={CONCEPT_TYPE_OPTIONS}
        changeMultiple="conceptType"
        disabled={editing}
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
            searchSource="ISMD"
            searchType="CLASS"
            single
          />
          <DataTypeInput
            name="dataType"
            anchor="dataType"
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
            searchType="CLASS"
            searchSource="ISMD"
            single
          />
          <ConceptInput
            name="range"
            anchor="range"
            label={t('TypesSection.RelationRangeLabel')}
            placeholder={t('TypesSection.RelationRangePlaceholder')}
            searchType="CLASS"
            searchSource="ISMD"
            single
          />
        </>
      )}
    </FormSection>
  );
};
