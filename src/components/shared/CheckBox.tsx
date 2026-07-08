import { GovFormLabel } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useFormContext } from 'react-hook-form';

import { useActiveAnchor } from '@/hooks/useActiveAnchor';

export const CheckBox = ({ name, label }: { name: string; label: string }) => {
  const { register, setValue, getValues } = useFormContext();
  const isActive = useActiveAnchor(name);

  const toggle = () =>
    setValue(name, !getValues(name), {
      shouldValidate: true,
      shouldDirty: true,
    });

  return (
    <div
      className={clsx(
        'grid-cols-7 grid w-full space-y-2 p-2.5 rounded-lg',
        isActive && 'bg-blue-subtle',
      )}
    >
      <div className="flex gap-2 col-start-2 ml-10 col-span-5" id={name}>
        <input
          id={`checkbox-${name}`}
          type="checkbox"
          {...register(name)}
          className="w-fit"
        />
        <GovFormLabel
          size="m"
          className="w-fit mb-0! cursor-pointer"
          onClick={toggle}
        >
          <span className="font-bold">{label}</span>
        </GovFormLabel>
      </div>
    </div>
  );
};
