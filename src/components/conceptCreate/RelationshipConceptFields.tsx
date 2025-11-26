import {
  GovFormControl,
  GovFormInput,
  GovFormLabel,
  GovFormSelect,
} from '@gov-design-system-ce/react';

import { ConceptDetailModel } from '@/api/generated';

import { CommonConceptFields, CommonFieldsProps } from './CommonConceptFields';

export interface RelationshipConceptFieldsProps extends CommonFieldsProps {
  concepts?: ConceptDetailModel[];
}

export const RelationshipConceptFields = ({
  register,
  errors,
  control,
  form,
  concepts,
}: RelationshipConceptFieldsProps) => {
  return (
    <>
      <GovFormControl>
        <GovFormLabel size="m">Domain</GovFormLabel>
        <GovFormSelect {...register('domain')}>
          {concepts?.map((item, index) => (
            <option key={index} label={item.název?.cs || ''} value={item.iri} />
          ))}
        </GovFormSelect>
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">Range</GovFormLabel>
        <GovFormSelect {...register('range')}>
          {concepts?.map((item, index) => (
            <option key={index} label={item.název?.cs || ''} value={item.iri} />
          ))}
        </GovFormSelect>
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">Super Relation</GovFormLabel>
        <GovFormInput {...register('superRelation')} />
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
