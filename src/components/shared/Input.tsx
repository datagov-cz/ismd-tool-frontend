import { InputHTMLAttributes } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ErrorText } from './ErrorText';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

export const Input = ({ label, placeholder, name }: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="relative w-full space-y-0.5">
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
              className={`bg-white dark:bg-dark-primary border rounded-lg focus-within:outline-2 focus-within:outline-status-focus hover:bg-field-hover dark:hover:bg-dark-field-hover ${errors[name] ? 'border-status-error-700 dark:border-status-error-200' : 'border-gray-border dark:border-dark-border'}`}
            >
              <input
                id={field.name}
                placeholder={placeholder}
                value={field.value ?? ''}
                onChange={field.onChange}
                type="text"
                className="w-full appearance-none overflow-hidden text-ellipsis whitespace-nowrap border-none bg-transparent text-left outline-none py-2 px-3"
              />
            </div>
          </div>
        )}
      />
      {errors[name] && <ErrorText text={errors[name]?.message as string} />}
    </div>
  );
};
