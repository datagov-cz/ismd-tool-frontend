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

export const PropertyCreateFields = ({
  register,
  errors,
  control,
  form,
}: CommonFieldsProps) => {
  const t = useTranslations('CreateConcept.PropertyCreateFields');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'superProperty',
  });

  return (
    <>
      <ConceptSelectInput
        register={register}
        name="domain"
        errors={errors}
        label={t('Labels.Domain')}
      />

      <div className="flex gap-2 items-end w-full">
        <div className="flex flex-col w-full">
          {fields.map((field, index) => (
            <div className="flex gap-2 items-end w-full" key={field.id}>
              <ConceptSelectInput
                register={register}
                name={`superProperty.${index}.value`}
                errors={errors}
                label={index === 0 ? t('Labels.SuperProperty') : ''}
                conceptType="VLASTNOST"
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

      <GovFormControl>
        <GovFormLabel size="m">{t('Labels.DataType')}</GovFormLabel>
        <GovFormSelect {...register('dataType')}>
          <option value="rdfs:Literal" label="rdfs:Literal" />
          <option value="Ano či ne" label="Ano či ne" />
          <option value="Datum" label="Datum" />
          <option value="Čas" label="Čas" />
          <option value="Datum a čas" label="Datum a čas" />
          <option value="Celé číslo" label="Celé číslo" />
          <option value="Desetinné číslo" label="Desetinné číslo" />
          <option value="URI, IRI, URL" label="URI, IRI, URL" />
          <option value="Řetězec" label="Řetězec" />
          <option value="Text" label="Text" />
        </GovFormSelect>
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
