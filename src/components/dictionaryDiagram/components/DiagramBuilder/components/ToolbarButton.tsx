import { GovIcon } from '@gov-design-system-ce/react';

type ToolbarButtonProps = {
  icon?: string;
  label?: string;
  trailingIcon?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export const ToolbarButton = ({
  icon,
  label,
  trailingIcon,
  onClick,
  disabled,
}: ToolbarButtonProps) => (
  <button
    onClick={onClick}
    className="flex gap-2 items-center py-1.5 px-3 hover:bg-blue-subtle whitespace-nowrap transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
    disabled={disabled}
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
