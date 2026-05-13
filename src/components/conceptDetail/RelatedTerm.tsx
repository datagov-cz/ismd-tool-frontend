import { GovIcon } from '@gov-design-system-ce/react';
import Link from 'next/link';

export const RelatedTerm = ({
  label,
  href,
}: {
  label: string;
  href: string;
}) => {
  return (
    <Link
      href={href}
      className="border border-border-primary bg-primary-subtlest w-full gap-1.5 flex rounded-md text-blue-button-active font-bold hover:underline p-2 "
    >
      <GovIcon
        slot="icon-start"
        name="card-heading"
        type="components"
        size="l"
        color="primary"
        className="mt-0.5! shrink-0"
      />
      {label}
    </Link>
  );
};
