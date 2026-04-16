import { AnchorHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import Link from 'next/link';

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  color?: 'primary' | 'secondary';
  type?: 'base' | 'solid' | 'outlined';
  size?: 's' | 'm' | 'l';
  className?: string;
  children?: ReactNode;
}

export const ButtonLink = ({
  href,
  type = 'base',
  size = 's',
  className,
  children,
  ...props
}: Props) => {
  const sizeClasses = {
    s: 'h-8',
    m: 'h-10',
    l: 'h-12',
  };

  const typeClasses = {
    solid:
      'bg-blue-primary text-dark-text hover:bg-blue-hover disabled:bg-button-solid-disabled dark:hover:bg-dark-blue-hover',
    outlined:
      'border border-blue-primary text-blue-primary hover:text-blue-hover hover:border-blue-hover hover:bg-blue-outlined-hover disabled:border-button-solid-disabled disabled:text-button-solid-disabled',
    base: '',
  };

  return (
    <Link
      href={href ?? '/'}
      className={clsx(
        'px-4 flex justify-center gap-x-3 items-center whitespace-nowrap appearance-none rounded-lg font-bold cursor-pointer transition-colors duration-200',
        sizeClasses[size],
        typeClasses[type],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
};
