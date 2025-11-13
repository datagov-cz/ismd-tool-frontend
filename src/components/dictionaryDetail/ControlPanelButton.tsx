import { ButtonHTMLAttributes } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconName: string;
  ariaLabel: string;
}

export const ControlPanelButton = ({
  iconName,
  ariaLabel,
  className,
  ...props
}: Props) => {
  return (
    <button
      className={clsx(
        'hover:bg-blue group transition-colors box-content rounded-lg p-2 cursor-pointer flex items-center justify-center bg-blue-primary',
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
