import {
  GovFormControl,
  GovFormInput,
  GovFormLabel,
  GovFormSelect,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { CommonConceptFields, CommonFieldsProps } from './CommonConceptFields';

export const ClassCreateFields = ({
  register,
  errors,
  control,
  form,
}: CommonFieldsProps) => {
  const t = useTranslations('CreateConcept.ClassCreateFields');

  return (
    <>
      <GovFormControl>
        <GovFormLabel size="m">{t('Labels.ClassType')}</GovFormLabel>
        <GovFormSelect {...register('type')}>
          <option
            value="Typ subjektu práva"
            label={t('Options.ClassType.SubjectOfLawType')}
          />
          <option
            value="Typ objektu práva"
            label={t('Options.ClassType.ObjectOfLawType')}
          />
        </GovFormSelect>
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">{t('Labels.BroaderClass')}</GovFormLabel>
        <GovFormInput
          {...register('broaderConcept')}
          invalid={'broaderConcept' in errors && !!errors.broaderConcept}
        />
        {'broaderConcept' in errors && errors.broaderConcept && (
          <span className="text-red-600 text-sm">
            {errors.broaderConcept.message}
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
