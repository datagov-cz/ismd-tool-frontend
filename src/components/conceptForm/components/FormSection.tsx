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
        'py-5 px-3 rounded-lg shadow-subtle transition-colors duration-300 ease-in',
        variant === 'neutral'
          ? 'bg-surface-subtlest border border-gray-border'
          : 'bg-surface-card border border-border-default',
      )}
    >
      <div className="flex gap-2 items-center pb-2 pl-2.5">
        {icon && (
          <GovIcon type="components" color={'primary'} size="m" name={icon} />
        )}
        <span
          className={clsx(
            ' text-md font-bold transition-all duration-300 ease-in',
            'text-accent',
          )}
        >
          {label}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
};
