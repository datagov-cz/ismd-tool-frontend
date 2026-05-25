import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import Link from 'next/link';

export const RelatedTerm = ({
  label,
  href,
  noIcon,
  remove,
  ontologyLabel,
}: {
  label: string;
  href?: string;
  noIcon?: boolean;
  remove?: () => void;
  ontologyLabel?: string;
}) => {
  const className = clsx(
    'border border-border-primary bg-primary-subtlest w-full gap-1.5 flex rounded-md text-blue-button-active p-2',
    noIcon ? 'grayscale' : 'font-bold',
  );

  const content = (
    <>
      <span className="flex gap-1.5">
        {!noIcon && (
          <GovIcon
            slot="icon-start"
            name="card-heading"
            type="components"
            size="l"
            color="primary"
            className="mt-0.5! shrink-0"
          />
        )}
        {label}
        {remove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              remove();
            }}
            className="flex items-center justify-center ml-auto"
          >
            <GovIcon name="x" type="components" size="2xl" color="primary" />
          </button>
        )}
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
          {label}
        </span>
      )}
    </>
  );

  if (remove || !href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link
      href={href}
      className={clsx(className, 'hover:underline cursor-pointer')}
    >
      {content}
    </Link>
  );
};
