'use client';

import { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { SectionTitle } from '@/components/shared/SectionTitle';

const formSection = cva(
  'py-5 px-3 rounded-lg shadow-subtle transition-colors duration-300 ease-in',
  {
    variants: {
      variant: {
        default: 'bg-white',
        neutral:
          'bg-(--background-neutral-subtlest) border border-(--border-subtle)',
        primary: 'bg-primary-subtlest',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type Props = VariantProps<typeof formSection> & {
  label: ReactNode;
  icon: string | null;
  children: ReactNode;
};

export const FormSection = ({ label, icon, children, variant }: Props) => {
  return (
    <div className={formSection({ variant })}>
      <div className="pb-2 pl-2.5">
        <SectionTitle icon={icon} label={label} size="md" />
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
};
