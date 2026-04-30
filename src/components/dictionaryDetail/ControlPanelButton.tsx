import { ButtonHTMLAttributes } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconName: string;
  ariaLabel: string;
  onClick: () => void;
  danger?: boolean;
}

export const ControlPanelButton = ({
  iconName,
  ariaLabel,
  danger,
  onClick,
}: Props) => {
  return (
    <GovButton
      color={danger ? 'error' : 'primary'}
      type="base"
      onGovClick={onClick}
    >
      <GovIcon
        name={iconName}
        size="l"
        aria-label={ariaLabel}
        className="text-white"
      />
    </GovButton>
  );
};
