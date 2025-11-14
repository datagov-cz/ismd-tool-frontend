import { ButtonHTMLAttributes } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconName: string;
  ariaLabel: string;
  danger?: boolean;
}

export const ControlPanelButton = ({
  iconName,
  ariaLabel,
  className,
  danger,
  ...props
}: Props) => {
  return (
    <button
      className={clsx(
        'group transition-colors box-content rounded-lg p-2 cursor-pointer flex items-center justify-center',
        danger
          ? 'bg-status-error-600 hover:bg-status-error-700'
          : 'bg-blue-primary hover:bg-blue',
        className,
      )}
      {...props}
    >
      <GovIcon
        name={iconName}
        size="xl"
        aria-label={ariaLabel}
        className="text-white"
      />
    </button>
  );
};
