import { ButtonHTMLAttributes } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';

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
      className={`hover:bg-blue/20 transition-colors rounded p-2 cursor-pointer size-6 flex items-center justify-center ${className && className}`}
      {...props}
    >
      <GovIcon name={iconName} size="xl" aria-label={ariaLabel} />
    </button>
  );
};
