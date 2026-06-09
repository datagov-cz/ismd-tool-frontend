import { GovFormLabel, GovFormSelect } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { Controller, useFormContext } from 'react-hook-form';

import { usePropertyDatatypes } from '@/api/generated';
import { useActiveAnchor } from '@/hooks/useActiveAnchor';

import { CircularLoader } from './CircularLoader';

interface Props {
  label: string;
  name: string;
  anchor?: string;
}

export const DataTypeInput = ({ label, name, anchor }: Props) => {
  const form = useFormContext();
  const isActive = useActiveAnchor(anchor);
  const { data, isLoading } = usePropertyDatatypes();
  return (
    <div
      id={anchor}
      className={clsx(isActive && 'bg-blue-subtle', 'p-2.5 rounded-lg')}
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
              <GovFormSelect
                value={field.value?.code ?? ''}
                onGovChange={(e) => {
                  const selected = data?.data?.find(
                    (d) => d.code === e.target.value,
                  );
                  field.onChange(
                    selected
                      ? { code: selected.code, label: selected.label }
                      : undefined,
                  );
                  field.onBlur();
                }}
              >
                {isLoading && <CircularLoader />}
                {data?.data?.map((input) => (
                  <option
                    key={input.code}
                    value={input.code}
                    label={input.label}
                  />
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
    </div>
  );
};
