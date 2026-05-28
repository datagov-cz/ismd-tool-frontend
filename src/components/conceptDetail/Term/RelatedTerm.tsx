import { GovIcon } from '@gov-design-system-ce/react';
import Link from 'next/link';

export const RelatedTerm = ({
  label,
  href,
  ontologyLabel,
}: {
  label: string;
  href: string;
  ontologyLabel?: string;
}) => {
  return (
    <Link
      href={href}
      className="border border-border-primary bg-primary-subtlest w-full flex flex-col rounded-md text-blue-button-active font-bold hover:underline p-2 "
    >
      <span className="flex gap-1.5">
        <GovIcon
          slot="icon-start"
          name="card-heading"
          type="components"
          size="l"
          color="primary"
          className="mt-0.5! shrink-0"
        />
        {label}
      </span>
      {ontologyLabel && (
        <span className="flex gap-1.5 pl-6 font-normal text-dark-primary">
          <GovIcon
            slot="icon-start"
            name="journal-text"
            type="components"
            size="s"
            color="success"
            className="shrink-0 mt-1!"
          />
          {ontologyLabel}
        </span>
      )}
    </Link>
  );
};
