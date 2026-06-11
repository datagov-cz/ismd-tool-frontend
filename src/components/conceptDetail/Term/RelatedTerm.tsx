import {
  GovIcon,
  GovTooltip,
  GovTooltipContent,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export const RelatedTerm = ({
  label,
  href,
  noIcon,
  remove,
  ontologyLabel,
  warning,
}: {
  label: string;
  href?: string;
  noIcon?: boolean;
  remove?: () => void;
  ontologyLabel?: string;
  warning?: boolean;
}) => {
  const className = clsx(
    'border border-border-primary bg-primary-subtlest w-full flex flex-col rounded-md text-blue-button-active',
    noIcon ? 'grayscale' : 'font-bold',
    ontologyLabel || warning ? 'px-2 py-1' : 'p-2',
  );

  const t = useTranslations('ConceptDetail.Main');

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
          {ontologyLabel}
        </span>
      )}
      {warning && (
        <GovTooltip position="bottom" className="border-0!">
          <GovTooltipContent className="z-1000!">
            {t('WarningTooltip')}
          </GovTooltipContent>
          <span className="flex gap-1.5 pl-6 font-normal text-status-warning-600 text-sm w-fit cursor-help">
            <GovIcon
              slot="icon-start"
              name="exclamation-triangle"
              type="components"
              size="s"
              color="warning"
              className="shrink-0 mt-1!"
            />
            {t('Warning')}
          </span>
        </GovTooltip>
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
