import { SelectHTMLAttributes } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { Controller, useFormContext } from 'react-hook-form';

import { ErrorText } from './ErrorText';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: string[];
}

export const Select = ({
  label,
  name,
  options,
  className,
  ...props
}: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className={`relative w-full space-y-0.5 ${className}`}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="flex flex-col gap-0.5">
            <label
              htmlFor={field.name}
              className={`text-sm cursor-pointer ${errors[name] ? 'text-status-error-700 dark:text-status-error-200' : 'text-gray-label dark:text-dark-label'}`}
            >
              {label}
            </label>
            <div
              className={`bg-white relative flex dark:bg-dark-primary border rounded-lg focus-within:outline-2 focus-within:outline-status-focus hover:bg-field-hover dark:hover:bg-dark-field-hover ${errors[name] ? 'border-status-error-700 dark:border-status-error-200' : 'border-gray-border dark:border-dark-border'}`}
            >
              <select
                {...props}
                id={field.name}
                value={field.value ?? ''}
                onChange={field.onChange}
                className="w-full appearance-none overflow-hidden text-ellipsis whitespace-nowrap border-none bg-transparent text-left outline-none py-2 px-3"
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <GovIcon
                name="chevron-down"
                slot="icon-end"
                className="size-3 transition-transform duration-200 absolute top-1/2 -translate-y-1/2 right-2 pointer-events-none"
              />
            </div>
          </div>
        )}
      />
      {errors[name] && <ErrorText text={errors[name]?.message as string} />}
    </div>
  );
};
