import { ButtonHTMLAttributes } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconName: string;
  ariaLabel: string;
  onClick: () => void;
  danger?: boolean;
  label?: string;
}

export const ControlPanelButton = ({
  iconName,
  ariaLabel,
  danger,
  onClick,
  label,
}: Props) => {
  return (
    <GovButton
      color={danger ? 'error' : 'primary'}
      type="base"
      onGovClick={onClick}
      size="m"
      className="h-8! [&_button]:h-8!"
    >
      <GovIcon
        name={iconName}
        size="m"
        aria-label={ariaLabel}
        className="text-white"
      />
      {label}
    </GovButton>
  );
};
