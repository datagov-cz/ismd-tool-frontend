import { GovIcon } from '@gov-design-system-ce/react';

type ToolbarButtonProps = {
  icon?: string;
  label?: string;
  trailingIcon?: string;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaPressed?: boolean;
};

export const ToolbarButton = ({
  icon,
  label,
  trailingIcon,
  onClick,
  disabled,
  ariaLabel,
  ariaPressed,
}: ToolbarButtonProps) => (
  <button
    onClick={onClick}
    className="flex gap-2 items-center py-1.5 px-3 hover:bg-blue-subtle whitespace-nowrap transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
    disabled={disabled}
    aria-label={ariaLabel}
    aria-pressed={ariaPressed}
  >
    {icon && (
      <GovIcon type="components" name={icon} color="primary" size="xs" />
    )}

    {label}

    {trailingIcon && (
      <GovIcon type="components" name={trailingIcon} color="primary" size="s" />
    )}
  </button>
);
