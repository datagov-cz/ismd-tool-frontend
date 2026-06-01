'use client';

import { ReactNode } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';

import { useActiveAnchor } from '@/hooks/useActiveAnchor';

export const FormSection = ({
  label,
  icon,
  children,
  anchor,
}: {
  label: string;
  icon: string;
  children: ReactNode;
  anchor?: string;
}) => {
  const isActive = useActiveAnchor(anchor);

  return (
    <div
      className={clsx(
        'py-5 px-6 rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-colors duration-300 ease-in',
        isActive
          ? 'border border-status-warning-200 bg-status-warning-100'
          : 'bg-white',
      )}
      id={anchor}
    >
      <div className="flex gap-2 items-center pb-5">
        <GovIcon
          type="components"
          color={isActive ? 'secondary' : 'primary'}
          size="m"
          name={icon}
        />
        <span
          className={clsx(
            ' text-md font-bold transition-all duration-300 ease-in',
            isActive ? 'text-status-warning-200' : 'text-blue-primary',
          )}
        >
          {label}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
};
