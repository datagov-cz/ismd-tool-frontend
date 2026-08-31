import { GovFormLabel, GovFormSelect } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { Controller, useFormContext } from 'react-hook-form';

import { useActiveAnchor } from '@/hooks/useActiveAnchor';

interface Props {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  changeMultiple?: string;
  anchor?: string;
  disabled?: boolean;
}

export const Select = ({
  label,
  name,
  options,
  changeMultiple,
  anchor,
  disabled,
}: Props) => {
  const form = useFormContext();
  const isActive = useActiveAnchor(anchor);
  return (
    <div
      id={anchor}
      className={clsx(isActive && 'bg-blue-subtle', 'p-2.5 rounded-lg')}
    >
      <Controller
        control={form.control}
        name={name}
        disabled={disabled}
        render={({ field }) => (
          <div className="w-full grid grid-cols-7 gap-y-4 gap-x-2">
            <GovFormLabel className="w-fit! pt-2.5">
              <span className="font-bold">{label}</span>
            </GovFormLabel>
            <div className="col-span-6 relative ml-10">
              <GovFormSelect
                value={field.value}
                onChange={(e) => {
                  const val = e.currentTarget.value;
                  field.onChange(val);
                  field.onBlur();
                  if (changeMultiple) {
                    form.setValue(changeMultiple, val);
                  }
                }}
                disabled={disabled}
              >
                {options.map(({ value, label }) => (
                  <option key={value} value={value} label={label} />
                ))}
              </GovFormSelect>
              {form.formState.errors[name] && (
                <span className="text-status-error-600 text-sm absolute bottom-0 left-2 translate-y-full">
                  {String(form.formState.errors[name]?.message)}
                </span>
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
};
