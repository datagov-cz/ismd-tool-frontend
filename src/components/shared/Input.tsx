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

import { useActiveAnchor } from '@/hooks/useActiveAnchor';

interface Props<T extends FieldValues> {
  label: string;
  placeholder: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  multiline?: boolean;
  disabled?: boolean;
  required?: boolean;
  anchor?: string;
  layout?: 'grid' | 'flex';
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
  layout = 'grid',
}: Props<T>) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const error = get(errors, name);
  const isActive = useActiveAnchor(anchor);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div
          className={clsx(
            'w-full p-2.5 rounded-lg',
            isActive && 'bg-blue-subtle',
            layout === 'grid'
              ? 'grid grid-cols-7 gap-y-4 gap-x-2'
              : 'flex flex-col',
          )}
          id={anchor}
        >
          <GovFormLabel className="w-fit! pt-2.5">
            <span className="font-bold">
              {label}
              {required && <span className="text-status-error-700"> *</span>}
            </span>
          </GovFormLabel>
          <div
            className={clsx(
              'col-span-6 relative',
              layout === 'grid' ? 'ml-10' : 'ml-0',
            )}
          >
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
  );
};
