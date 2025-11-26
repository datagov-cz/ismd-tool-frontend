import {
  GovFormControl,
  GovFormInput,
  GovFormLabel,
} from '@gov-design-system-ce/react';

import { CommonConceptFields, CommonFieldsProps } from './CommonConceptFields';

export const ClassCreateFields = ({
  register,
  errors,
  control,
  form,
}: CommonFieldsProps) => {
  return (
    <>
      <GovFormControl>
        <GovFormLabel size="m">Type</GovFormLabel>
        <GovFormInput {...register('type')} />
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">Broader Concept</GovFormLabel>
        <GovFormInput {...register('broaderConcept')} />
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
