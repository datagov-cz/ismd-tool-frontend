import { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'primary' | 'secondary';
  styleType?: 'base' | 'solid' | 'outlined';
  className?: string;
  children?: ReactNode;
}

export const Button = ({
  styleType = 'base',
  className,
  children,
  ...props
}: Props) => {
  return (
    <button
      className={`px-4 py-2 flex justify-center gap-x-3 active:bg-blue-button-active items-center whitespace-nowrap flex-nowrap appearance-none rounded-lg disabled:bg-gray-border font-bold disabled:cursor-not-allowed cursor-pointer transition-colors duration-200 ${styleType === 'solid' ? 'bg-blue-primary text-dark-text hover:bg-blue-hover disabled:bg-button-solid-disabled' : 'border-blue-primary border text-blue-primary hover:text-blue-hover hover:border-blue-hover hover:bg-blue-outlined-hover disabled:border-button-solid-disabled disabled:text-button-solid-disabled'} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};
