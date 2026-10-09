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
  layout?: 'grid' | 'flex';
}

export const DataTypeInput = ({
  label,
  name,
  anchor,
  layout = 'grid',
}: Props) => {
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
          <div
            className={clsx(
              'w-full',
              layout === 'grid'
                ? 'grid grid-cols-7 gap-y-4 gap-x-2'
                : 'flex flex-col',
            )}
          >
            <GovFormLabel size="m" className="w-fit! pt-2.5">
              <span className="font-bold">{label}</span>
            </GovFormLabel>
            <div
              className={clsx(
                'col-span-6 relative',
                layout === 'grid' ? 'ml-10' : 'ml-0',
              )}
            >
              <GovFormSelect
                size="m"
                value={field.value?.code ?? ''}
                onChange={(e) => {
                  const selected = data?.data?.find(
                    (d) => d.code === e.currentTarget.value,
                  );
                  field.onChange(
                    selected
                      ? { code: selected.code, label: selected.label }
                      : undefined,
                  );
                  field.onBlur();
                }}
              >
                <option value="" label="" />
                {data?.data?.map((input) => (
                  <option
                    key={input.code}
                    value={input.code}
                    label={input.label}
                  />
                ))}
              </GovFormSelect>
              {isLoading && (
                <span className="absolute right-9 top-1/2 -translate-y-1/2">
                  <CircularLoader />
                </span>
              )}

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
