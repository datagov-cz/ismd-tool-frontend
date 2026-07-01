'use client';

import { ReactNode } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';

type Props = {
  label: ReactNode;
  icon: string | null;
  children: ReactNode;
  variant?: 'default' | 'neutral';
};

export const FormSection = ({
  label,
  icon,
  children,
  variant = 'default',
}: Props) => {
  return (
    <div
      className={clsx(
        'py-5 px-3 rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-colors duration-300 ease-in',
        variant === 'neutral'
          ? 'bg-(--background-neutral-subtlest) border border-(--border-subtle)'
          : 'bg-white',
      )}
    >
      <div className="flex gap-2 items-center pb-2 pl-2.5">
        {icon && (
          <GovIcon type="components" color={'primary'} size="m" name={icon} />
        )}
        <span
          className={clsx(
            ' text-md font-bold transition-all duration-300 ease-in',
            'text-blue-primary',
          )}
        >
          {label}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
};
