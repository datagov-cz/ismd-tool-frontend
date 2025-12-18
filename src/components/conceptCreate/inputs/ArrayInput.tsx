import {
  GovButton,
  GovFormControl,
  GovFormInput,
  GovFormLabel,
  GovIcon,
} from '@gov-design-system-ce/react';
import {
  FieldErrors,
  useFieldArray,
  UseFormRegister,
  UseFormReturn,
} from 'react-hook-form';

import { CreateConceptFormData } from '../createConceptSchema';

type ArrayInputName =
  | 'definingNonLegalSource'
  | 'definingLegalSource'
  | 'relatedNonLegalSource'
  | 'relatedLegalSource'
  | 'privacyProvision'
  | 'exactMatch';

interface ArrayInputProps {
  register: UseFormRegister<CreateConceptFormData>;
  errors: FieldErrors<CreateConceptFormData>;
  form: UseFormReturn<CreateConceptFormData, unknown, unknown>;
  name: ArrayInputName;
  label: string;
}

export const ArrayInput = ({
  register,
  form,
  name,
  label,
  errors,
}: ArrayInputProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: name,
  });

  return (
    <div className="flex gap-2 items-end">
      <div className="flex flex-col w-full gap-2">
        {fields.map((field, index) => (
          <GovFormControl
            key={field.id}
            className="flex gap-2 flex-row w-full [&_.gov-form-control__holder]:w-full!"
          >
            <div className="w-full">
              {index === 0 && <GovFormLabel size="m">{label}</GovFormLabel>}
              <div className="flex gap-2 w-full">
                <div className="flex flex-col w-full">
                  <GovFormInput {...register(`${name}.${index}.value`)} />
                  {errors[name] && (
                    <span className="text-red-600 text-sm mt-1">
                      {errors[name]?.root?.message ||
                        errors[name][index]?.value?.message}
                    </span>
                  )}
                </div>
                {fields.length > 1 && (
                  <GovButton
                    nativeType="button"
                    color="error"
                    type="solid"
                    onGovClick={() => remove(index)}
                  >
                    <GovIcon name="trash" size="l" className="text-white" />
                  </GovButton>
                )}
              </div>
            </div>
          </GovFormControl>
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
  );
};
