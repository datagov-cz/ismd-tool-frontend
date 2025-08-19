import { ReactNode } from 'react';
import Link, { LinkProps } from 'next/link';

interface Props extends LinkProps {
  color?: 'primary' | 'secondary';
  type?: 'base' | 'solid' | 'outlined';
  className?: string;
  children?: ReactNode;
}

export const ButtonLink = ({
  href,
  color = 'primary',
  type = 'base',
  className,
  children,
  ...props
}: Props) => {
  return (
    <Link
      href={href}
      className={`h-8 px-4 flex justify-center gap-x-3 items-center whitespace-nowrap flex-nowrap appearance-none rounded-lg font-bold cursor-pointer transition-colors duration-200 ${type === 'solid' ? 'bg-blue-primary text-dark-text hover:bg-blue-hover disabled:bg-button-solid-disabled' : 'border-blue-primary border text-blue-primary hover:text-blue-hover hover:border-blue-hover hover:bg-blue-outlined-hover disabled:border-button-solid-disabled disabled:text-button-solid-disabled'} ${className || ''}`}
      {...props}
    >
      {children}
    </Link>
  );
};
