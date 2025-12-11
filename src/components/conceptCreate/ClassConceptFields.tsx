import {
  GovButton,
  GovFormControl,
  GovFormLabel,
  GovFormSelect,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { useFieldArray } from 'react-hook-form';

import { CommonConceptFields, CommonFieldsProps } from './CommonConceptFields';
import { ConceptSelectInput } from './inputs/ConceptSelectInput';

export const ClassCreateFields = ({
  register,
  errors,
  control,
  form,
}: CommonFieldsProps) => {
  const t = useTranslations('CreateConcept.ClassCreateFields');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'broaderConcept',
  });

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

      <div className="flex gap-2 items-end w-full">
        <div className="flex flex-col w-full">
          {fields.map((field, index) => (
            <div className="flex gap-2 items-end w-full" key={field.id}>
              <ConceptSelectInput
                register={register}
                name={`broaderConcept.${index}.value`}
                errors={errors}
                label={index === 0 ? t('Labels.BroaderConcept') : ''}
                conceptType="TRIDA"
              />
              {fields.length > 1 && (
                <GovButton
                  nativeType="button"
                  color="error"
                  type="solid"
                  className="mt-2"
                  onGovClick={() => remove(index)}
                >
                  <GovIcon name="trash" size="l" className="text-white" />
                </GovButton>
              )}
            </div>
          ))}
        </div>
        <GovButton
          nativeType="button"
          type="outlined"
          color="primary"
          onGovClick={() => append({ value: '' })}
        >
          +
        </GovButton>
      </div>

      <CommonConceptFields
        register={register}
        errors={errors}
        control={control}
        form={form}
      />
    </>
  );
};
