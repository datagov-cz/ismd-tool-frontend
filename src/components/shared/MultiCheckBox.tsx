import { GovFormLabel } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useFormContext } from 'react-hook-form';

import { useActiveAnchor } from '@/hooks/useActiveAnchor';

interface MultiCheckBoxOption {
  value: string;
  label: string;
}

interface MultiCheckBoxProps {
  name: string;
  label: string;
  options: MultiCheckBoxOption[];
}

export const MultiCheckBox = ({ name, label, options }: MultiCheckBoxProps) => {
  const { setValue, watch } = useFormContext();
  const isActive = useActiveAnchor(name);

  const selected: string[] = watch(name) ?? [];

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    setValue(name, next, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div
      className={clsx(
        'grid-cols-7 grid w-full space-y-2 p-2.5 rounded-lg',
        isActive && 'bg-blue-subtle',
      )}
    >
      <GovFormLabel size="m" className="w-fit mb-0!">
        <span className="font-bold">{label}</span>
      </GovFormLabel>
      <div
        className="col-start-2 ml-10 col-span-5 flex flex-col gap-2"
        id={name}
      >
        <div className="flex flex-col gap-1.5">
          {options.map((option) => {
            const checkboxId = `checkbox-${name}-${option.value}`;
            return (
              <div key={option.value} className="flex gap-2">
                <input
                  id={checkboxId}
                  type="checkbox"
                  className="w-fit"
                  checked={selected.includes(option.value)}
                  onChange={() => toggle(option.value)}
                />
                <GovFormLabel
                  size="m"
                  className="w-fit mb-0! cursor-pointer"
                  onClick={() => toggle(option.value)}
                >
                  <span className="font-bold">{option.label}</span>
                </GovFormLabel>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
