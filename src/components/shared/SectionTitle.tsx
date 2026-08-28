import { ReactNode } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

const sectionTitleText = cva(
  'font-bold text-blue-primary transition-all duration-300 ease-in',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
  },
);

type Props = VariantProps<typeof sectionTitleText> & {
  label: ReactNode;
  icon?: string | null;
  className?: string;
};

export const SectionTitle = ({ label, icon, size, className }: Props) => {
  const text = (
    <span
      className={sectionTitleText({ size, class: clsx(!icon && className) })}
    >
      {label}
    </span>
  );

  if (!icon) {
    return text;
  }

  return (
    <div className={clsx('flex gap-2 items-center', className)}>
      <GovIcon type="components" color="primary" size="m" name={icon} />
      {text}
    </div>
  );
};
