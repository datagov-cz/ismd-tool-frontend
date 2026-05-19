import { GovFormInput, GovFormLabel } from '@gov-design-system-ce/react';
import {
  Controller,
  FieldValues,
  Path,
  useFormContext,
  UseFormRegister,
} from 'react-hook-form';

interface Props<T extends FieldValues> {
  label: string;
  placeholder: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  multiline?: boolean;
  disabled?: boolean;
}

export const Input = <T extends FieldValues>({
  label,
  placeholder,
  name,
  register,
  multiline,
  disabled,
}: Props<T>) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="w-full grid grid-cols-7 gap-y-4 gap-x-2">
          <GovFormLabel className="w-fit! pt-2.5">
            <span className="font-bold">{label}</span>
          </GovFormLabel>
          <div className="col-span-6 relative ml-10">
            <GovFormInput
              {...register(name)}
              id={field.name}
              placeholder={placeholder}
              className="border-0!"
              multiline={multiline}
              rows={4}
              disabled={disabled}
            />
            {errors[name]?.message && (
              <span className="text-red-600 text-sm absolute bottom-0 left-2 translate-y-full">
                {String(errors[name]?.message)}
              </span>
            )}
          </div>
        </div>
      )}
    />
  );
};
