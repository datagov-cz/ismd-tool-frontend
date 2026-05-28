import { ReactNode } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';

export const FormSection = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: ReactNode;
}) => {
  return (
    <div className="py-5 px-6 bg-white rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
      <div className="flex gap-2 items-center pb-5">
        <GovIcon type="components" color="primary" size="m" name={icon} />
        <span className="text-blue-primary text-md font-bold">{label}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
};
