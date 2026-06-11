import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import Link from 'next/link';

import { ConceptMetadataModelConceptType } from '@/api/generated';

export const RelatedTerm = ({
  label,
  href,
  noIcon,
  remove,
  ontologyLabel,
  type,
}: {
  label: string;
  href?: string;
  noIcon?: boolean;
  remove?: () => void;
  ontologyLabel?: string;
  type?: ConceptMetadataModelConceptType;
}) => {
  const className = clsx(
    'border border-border-primary bg-primary-subtlest w-full flex flex-col rounded-md text-blue-button-active',
    noIcon ? 'grayscale' : 'font-bold',
    !!ontologyLabel ? 'px-2 py-1' : 'p-2',
  );

  const content = (
    <>
      <span className="flex gap-1.5">
        {!noIcon && (
          <GovIcon
            slot="icon-start"
            name={
              type === 'VLASTNOST'
                ? 'tag'
                : type === 'VZTAH'
                  ? 'bezier2'
                  : 'card-heading'
            }
            type="components"
            size="l"
            color="primary"
            className={clsx(
              'shrink-0',
              type === 'VLASTNOST' || type === 'VZTAH' ? 'mt-1!' : 'mt-0.5!',
            )}
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
          {ontologyLabel}
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
