import {
  GovFormControl,
  GovFormInput,
  GovFormLabel,
  GovFormSelect,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';

import { CommonConceptFields, CommonFieldsProps } from './CommonConceptFields';

export interface RelationshipConceptFieldsProps extends CommonFieldsProps {
  concepts?: ConceptDetailModel[];
}

export const RelationshipConceptFields = ({
  register,
  errors,
  control,
  form,
  concepts,
}: RelationshipConceptFieldsProps) => {
  const t = useTranslations('CreateConcept.RelationshipConceptFields');

  return (
    <>
      <GovFormControl>
        <GovFormLabel size="m" required>
          {t('Labels.Domain')}
        </GovFormLabel>
        <GovFormSelect
          {...register('domain')}
          invalid={'domain' in errors && !!errors.domain}
        >
          <option label="" value="" />
          {concepts?.map((item, index) => (
            <option
              key={index}
              label={item.název?.cs || t('Options.Undefined')}
              value={item.iri}
            />
          ))}
        </GovFormSelect>
        {'domain' in errors && errors.domain && (
          <span className="text-red-600 text-sm">{errors.domain.message}</span>
        )}
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m" required>
          {t('Labels.Range')}
        </GovFormLabel>
        <GovFormSelect
          {...register('range')}
          invalid={'range' in errors && !!errors.range}
        >
          <option label="" value="" />
          {concepts?.map((item, index) => (
            <option
              key={index}
              label={item.název?.cs || t('Options.Undefined')}
              value={item.iri}
            />
          ))}
        </GovFormSelect>
        {'range' in errors && errors.range && (
          <span className="text-red-600 text-sm">{errors.range.message}</span>
        )}
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">{t('Labels.SuperRelation')}</GovFormLabel>
        <GovFormInput
          {...register('superRelation')}
          invalid={'superRelation' in errors && !!errors.superRelation}
        />
        {'superRelation' in errors && errors.superRelation && (
          <span className="text-red-600 text-sm">
            {errors.superRelation.message}
          </span>
        )}
      </GovFormControl>

      <CommonConceptFields
        register={register}
        errors={errors}
        control={control}
        form={form}
      />
    </>
  );
};
