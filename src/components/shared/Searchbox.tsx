import { HTMLAttributes } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';

interface Props extends HTMLAttributes<HTMLInputElement> {
  placeholder: string;
}

export const Searchbox = ({ placeholder, ...props }: Props) => {
  return (
    <div className="flex items-center gap-2 border border-dark-border rounded-lg px-4 py-3.5 relative">
      <GovIcon name="search" size="m" slot="icon-start" className="z-[2]" />
      <label htmlFor={props.id} className="hidden">
        {placeholder}
      </label>
      <input
        {...props}
        type="text"
        className="w-full absolute top-0 left-0 h-full rounded-lg pl-10 pr-4 z-[1] outline-none text-sm"
        placeholder={placeholder}
      />
    </div>
  );
};
