import { GovFormLabel, GovFormMultiSelect } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { Controller, useFormContext } from 'react-hook-form';

import { useActiveAnchor } from '@/hooks/useActiveAnchor';

interface Props {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  anchor?: string;
}

export const MultiSelect = ({ label, name, options, anchor }: Props) => {
  const form = useFormContext();
  const isActive = useActiveAnchor(anchor);
  return (
    <div
      id={anchor}
      className={clsx(
        'w-full space-y-2 p-2.5 rounded-lg',
        isActive && 'bg-blue-subtle',
      )}
    >
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <div className="w-full grid grid-cols-7 gap-y-4 gap-x-2">
            <GovFormLabel className="w-fit! pt-2.5">
              <span className="font-bold">{label}</span>
            </GovFormLabel>
            <div className="col-span-6 relative ml-10">
              <GovFormMultiSelect
                value={field.value}
                onGovChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val);
                  field.onBlur();
                }}
                options={options}
              />
              {form.formState.errors[name] && (
                <span className="text-red-600 text-sm absolute bottom-0 left-2 translate-y-full">
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
