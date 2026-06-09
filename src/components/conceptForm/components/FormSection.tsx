'use client';

import { ReactNode } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';

export const FormSection = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={clsx(
        'py-5 px-3 rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-colors duration-300 ease-in bg-white',
      )}
    >
      <div className="flex gap-2 items-center pb-2 pl-2.5">
        <GovIcon type="components" color={'primary'} size="m" name={icon} />
        <span
          className={clsx(
            ' text-md font-bold transition-all duration-300 ease-in',
            'text-blue-primary',
          )}
        >
          {label}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
};
