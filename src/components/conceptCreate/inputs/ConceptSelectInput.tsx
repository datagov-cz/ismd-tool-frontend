import { GovFormControl } from '@gov-design-system-ce/react/dist/gov-form-control';
import { GovFormLabel } from '@gov-design-system-ce/react/dist/gov-form-label';
import { GovFormSelect } from '@gov-design-system-ce/react/dist/gov-form-select';
import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from 'react-hook-form';

import { useGetConceptList } from '@/api/generated';
import { CreateConceptFormData } from '../createConceptSchema';

interface ConceptSelectInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  conceptType?: CreateConceptFormData['conceptTypeEnum'];
}

export const ConceptSelectInput = <T extends FieldValues>({
  register,
  errors,
  name,
  label,
  conceptType,
}: ConceptSelectInputProps<T>) => {
  const { data, isLoading } = useGetConceptList();
  const filteredConcepts = (data?.data || [])
    .filter((concept) => !conceptType || concept.conceptType === conceptType)
    .map((concept) => ({
      ...concept,
      conceptName: (concept.conceptName || '')
        .replace(/-/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase()),
    }))
    .sort((a, b) => a.conceptName.localeCompare(b.conceptName));

  return (
    <GovFormControl className="w-full" key={isLoading ? 'loading' : 'loaded'}>
      <GovFormLabel size="m">{label}</GovFormLabel>
      <GovFormSelect
        {...register(name)}
        invalid={name in errors && !!errors[name]}
      >
        <option value="" label=" " />
        {filteredConcepts?.map((item, index) => (
          <option
            key={index}
            label={item.conceptName}
            value={item.conceptIri || ''}
          />
        ))}
      </GovFormSelect>
      {name in errors && errors[name] && (
        <span className="text-red-600 text-sm">
          {errors[name]?.message as string}
        </span>
      )}
    </GovFormControl>
  );
};
