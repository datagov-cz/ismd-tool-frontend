import {
  GovFormControl,
  GovFormInput,
  GovFormLabel,
  GovFormSelect,
} from '@gov-design-system-ce/react';
import { Path } from 'react-hook-form';

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
}

export const TextWithLanguageInput = ({
  register,
  textInput,
  languageInput,
}: TextWithLanguageInputProps) => {
  return (
    <div className="flex gap-2">
      <GovFormControl className="w-full">
        <GovFormLabel size="m">{textInput.label}</GovFormLabel>
        <GovFormInput {...register(textInput.name)} />
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
