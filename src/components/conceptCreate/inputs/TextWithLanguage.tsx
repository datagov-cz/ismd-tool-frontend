import {
  GovFormControl,
  GovFormInput,
  GovFormLabel,
  GovFormSelect,
} from '@gov-design-system-ce/react';
import {
  FieldErrors,
  FieldValues,
  get,
  Path,
  UseFormRegister,
} from 'react-hook-form';

interface TextWithLanguageInputProps<T extends FieldValues> {
  textInput: {
    label: string;
    name: Path<T>;
  };
  languageInput: {
    label: string;
    name: Path<T>;
  };
  required?: boolean;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
}

export const TextWithLanguageInput = <T extends FieldValues>({
  register,
  textInput,
  languageInput,
  errors,
  required = false,
}: TextWithLanguageInputProps<T>) => {
  const fieldError = get(errors, textInput.name);

  return (
    <div className="flex gap-2 w-full">
      <GovFormControl className="w-full">
        <GovFormLabel size="m">{textInput.label}</GovFormLabel>
        <GovFormInput {...register(textInput.name)} required={required} />

        {fieldError && (
          <span className="text-red-600 text-sm">{fieldError.message}</span>
        )}
      </GovFormControl>

      <GovFormControl className="min-w-20">
        <GovFormLabel size="m">{languageInput.label}</GovFormLabel>
        <GovFormSelect {...register(languageInput.name)} defaultValue="cs">
          <option value="cs" label="CS" />
          <option value="en" label="EN" />
          <option value="sk" label="SK" />
        </GovFormSelect>
      </GovFormControl>
    </div>
  );
};
