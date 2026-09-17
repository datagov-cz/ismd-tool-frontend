import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';

type ToolbarButtonProps = {
  icon?: string;
  label?: string;
  trailingIcon?: string;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaPressed?: boolean;
  color?: 'primary' | 'error';
  labelOnHover?: boolean;
};

export const ToolbarButton = ({
  icon,
  label,
  trailingIcon,
  onClick,
  disabled,
  ariaLabel,
  ariaPressed,
  color = 'primary',
  labelOnHover = false,
}: ToolbarButtonProps) => (
  <button
    onClick={onClick}
    className={clsx(
      'group flex h-full items-center whitespace-nowrap px-3 py-1.5 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
      labelOnHover ? 'gap-0 hover:gap-2' : 'gap-2',
      color === 'error'
        ? 'text-status-error-600 hover:bg-status-error-100'
        : 'hover:bg-blue-subtle',
    )}
    disabled={disabled}
    aria-label={ariaLabel}
    aria-pressed={ariaPressed}
  >
    {icon && <GovIcon type="components" name={icon} color={color} size="xs" />}

    {labelOnHover ? (
      <span className="max-w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-w-48 group-hover:opacity-100 group-focus-visible:max-w-48 group-focus-visible:opacity-100">
        {label}
      </span>
    ) : (
      label
    )}

    {trailingIcon && (
      <GovIcon type="components" name={trailingIcon} color={color} size="s" />
    )}
  </button>
);
