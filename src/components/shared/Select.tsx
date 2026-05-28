import { GovFormLabel, GovFormSelect } from '@gov-design-system-ce/react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  changeMultiple?: string;
}

export const Select = ({ label, name, options, changeMultiple }: Props) => {
  const form = useFormContext();
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <div className="w-full grid grid-cols-7 gap-y-4 gap-x-2">
          <GovFormLabel className="w-fit! pt-2.5">
            <span className="font-bold">{label}</span>
          </GovFormLabel>
          <div className="col-span-6 relative ml-10">
            <GovFormSelect
              value={field.value}
              onGovChange={(e) => {
                const val = e.target.value;
                field.onChange(val);
                field.onBlur();
                if (changeMultiple) {
                  form.setValue(changeMultiple, val);
                }
              }}
            >
              {options.map(({ value, label }) => (
                <option key={value} value={value} label={label} />
              ))}
            </GovFormSelect>
            {form.formState.errors[name] && (
              <span className="text-red-600 text-sm absolute bottom-0 left-2 translate-y-full">
                {String(form.formState.errors[name]?.message)}
              </span>
            )}
          </div>
        </div>
      )}
    />
  );
};
