import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import {
  FieldErrors,
  useFieldArray,
  UseFormRegister,
  UseFormReturn,
} from 'react-hook-form';

import { CreateConceptFormData } from '../createConceptSchema';

import { TextWithLanguageInput } from './TextWithLanguage';

type ArrayInputLanguageName =
  | 'definitionModel'
  | 'descriptionModel'
  | 'altNameModel';

interface ArrayInputLanguageProps {
  register: UseFormRegister<CreateConceptFormData>;
  errors: FieldErrors<CreateConceptFormData>;
  form: UseFormReturn<CreateConceptFormData, unknown, unknown>;
  name: ArrayInputLanguageName;
  label: string;
}

export const ArrayInputLanguage = ({
  register,
  form,
  name,
  label,
  errors,
}: ArrayInputLanguageProps) => {
  const t = useTranslations('CreateConcept.CommonConceptFields');
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: name,
  });

  return (
    <div className="flex gap-2 items-end">
      <div className="flex flex-col w-full">
        {fields.map((field, index) => (
          <div className="flex gap-2 items-end w-full" key={field.id}>
            <TextWithLanguageInput
              textInput={{
                label: index === 0 ? label : '',
                name: `${name}.${index}.name`,
              }}
              languageInput={{
                label: index === 0 ? t('Labels.Language') : '',
                name: `${name}.${index}.languageTag`,
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
        onGovClick={() => append({ name: '', languageTag: 'cs' })}
        disabled={fields.length > 2}
      >
        +
      </GovButton>
    </div>
  );
};
