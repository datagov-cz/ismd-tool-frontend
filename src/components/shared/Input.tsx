import {
  GovFormInput,
  GovFormLabel,
  GovFormMessage,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import {
  Controller,
  FieldValues,
  get,
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
  required?: boolean;
  anchor?: string;
}

export const Input = <T extends FieldValues>({
  label,
  placeholder,
  name,
  register,
  multiline,
  disabled,
  anchor,
  required,
}: Props<T>) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const error = get(errors, name);

  return (
    <div id={anchor}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="w-full grid grid-cols-7 gap-y-4 gap-x-2">
            <GovFormLabel className="w-fit! pt-2.5">
              <span className="font-bold">
                {label}
                {required && <span className="text-status-error-700"> *</span>}
              </span>
            </GovFormLabel>
            <div className="col-span-6 relative ml-10">
              <GovFormInput
                {...register(name)}
                id={field.name}
                placeholder={placeholder}
                className={clsx('border-0!')}
                invalid={!!error?.message}
                multiline={multiline}
                rows={4}
                disabled={disabled}
              />
              {error?.message && (
                <GovFormMessage color="error" slot="bottom">
                  {String(error.message)}
                </GovFormMessage>
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
};
