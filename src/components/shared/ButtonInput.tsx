import { ComponentPropsWithoutRef, forwardRef } from 'react';
import clsx from 'clsx';

type Props = ComponentPropsWithoutRef<'button'>;

export const ButtonInput = forwardRef<HTMLButtonElement, Props>(
  ({ children, className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={clsx(
        'w-full border rounded-lg border-gray-border flex justify-between items-center py-2 px-4 text-card-description',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

ButtonInput.displayName = 'ButtonInput';
