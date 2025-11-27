import {
  GovFormControl,
  GovFormInput,
  GovFormLabel,
  GovFormSelect,
} from '@gov-design-system-ce/react';
import { get, Path } from 'react-hook-form';

import { CommonFieldsProps } from '../CommonConceptFields';
import { CreateConceptFormData } from '../createConceptSchema';

interface TextWithLanguageInputProps extends CommonFieldsProps {
  textInput: {
    label: string;
    name: Path<CreateConceptFormData>;
  };
  languageInput: {
    label: string;
    name: Path<CreateConceptFormData>;
  };
  required?: boolean;
}

export const TextWithLanguageInput = ({
  register,
  textInput,
  languageInput,
  errors,
  required = false,
}: TextWithLanguageInputProps) => {
  const fieldError = get(errors, textInput.name);

  return (
    <div className="flex gap-2">
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
          <option value="en" label="EN" disabled />
          <option value="sk" label="SK" disabled />
        </GovFormSelect>
      </GovFormControl>
    </div>
  );
};
