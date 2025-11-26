import {
  GovFormControl,
  GovFormInput,
  GovFormLabel,
  GovFormSelect,
} from '@gov-design-system-ce/react';

import { ConceptDetailModel } from '@/api/generated';

import { CommonConceptFields, CommonFieldsProps } from './CommonConceptFields';

export interface PropertyCreateFieldsProps extends CommonFieldsProps {
  concepts?: ConceptDetailModel[];
}

export const PropertyCreateFields = ({
  register,
  errors,
  control,
  form,
  concepts,
}: PropertyCreateFieldsProps) => {
  return (
    <>
      <GovFormControl>
        <GovFormLabel size="m">Data Type</GovFormLabel>
        <GovFormInput {...register('dataType')} />
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">Domain</GovFormLabel>
        <GovFormSelect {...register('domain')}>
          {concepts?.map((item, index) => (
            <option key={index} label={item.název?.cs || ''} value={item.iri} />
          ))}
        </GovFormSelect>
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">Super Property</GovFormLabel>
        <GovFormSelect {...register('superProperty')}>
          <option label={''} value={''} />
          {concepts?.map((item, index) => (
            <option key={index} label={item.název?.cs || ''} value={item.iri} />
          ))}
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
