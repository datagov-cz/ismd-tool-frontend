import {
  GovFormControl,
  GovFormInput,
  GovFormLabel,
  GovFormSelect,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';

import { CommonConceptFields, CommonFieldsProps } from './CommonConceptFields';

export interface PropertyCreateFieldsProps extends CommonFieldsProps {
  concepts?: ConceptDetailModel[];
}

export const PropertyCreateFields = ({
  register,
  errors,
  control,
  form,
  concepts,
}: PropertyCreateFieldsProps) => {
  const t = useTranslations('CreateConcept.PropertyCreateFields');

  return (
    <>
      <GovFormControl>
        <GovFormLabel size="m" required>
          {t('Labels.Domain')}
        </GovFormLabel>
        <GovFormSelect
          {...register('domain')}
          defaultValue={''}
          invalid={'domain' in errors && !!errors.domain}
        >
          <option label={''} value={''} />
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
        <GovFormLabel size="m">{t('Labels.SuperProperty')}</GovFormLabel>
        <GovFormInput
          {...register('superProperty')}
          invalid={'superProperty' in errors && !!errors.superProperty}
        />
        {'superProperty' in errors && errors.superProperty && (
          <span className="text-red-600 text-sm">
            {errors.superProperty.message}
          </span>
        )}
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">{t('Labels.DataType')}</GovFormLabel>
        <GovFormInput {...register('dataType')} />
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
