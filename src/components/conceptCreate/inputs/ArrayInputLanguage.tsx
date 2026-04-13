import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import {
  ArrayPath,
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
  useFieldArray,
  UseFormRegister,
  UseFormReturn,
} from 'react-hook-form';

import { TextWithLanguageInput } from './TextWithLanguage';

interface ArrayInputLanguageProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  form: UseFormReturn<T, unknown, unknown>;
  name: ArrayPath<T>;
  label: string;
  languageLabel?: string;
  maxFields?: number;
}

export const ArrayInputLanguage = <T extends FieldValues>({
  register,
  form,
  name,
  label,
  errors,
  languageLabel,
  maxFields = 3,
}: ArrayInputLanguageProps<T>) => {
  const t = useTranslations('CreateConcept.CommonConceptFields');
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: name,
  });

  const defaultLanguageLabel = languageLabel || t('Labels.Language');

  return (
    <div className="flex gap-2 items-end">
      <div className="flex flex-col w-full">
        {fields.map((field, index) => (
          <div className="flex gap-2 items-end w-full" key={field.id}>
            <TextWithLanguageInput<T>
              textInput={{
                label: index === 0 ? label : '',
                name: `${name}.${index}.name` as Path<T>,
              }}
              languageInput={{
                label: index === 0 ? defaultLanguageLabel : '',
                name: `${name}.${index}.languageTag` as Path<T>,
              }}
              register={register}
              errors={errors}
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
        onGovClick={() =>
          append({ name: '', languageTag: 'cs' } as PathValue<T, Path<T>>)
        }
        disabled={fields.length >= maxFields}
      >
        +
      </GovButton>
    </div>
  );
};
