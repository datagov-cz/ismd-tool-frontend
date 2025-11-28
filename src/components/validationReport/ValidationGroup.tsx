import { GovTag } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { ValidationResult } from '@/api/generated';

interface ValidationGroupProps {
  focusNodeName: string;
  severityGroups: [string, ValidationResult[]][];
  ontologySlug: string;
}

export const ValidationGroup = ({
  focusNodeName,
  severityGroups,
  ontologySlug,
}: ValidationGroupProps) => {
  const t = useTranslations('DictionaryDetail.ValidationSidebox');
  return (
    <div className="grid grid-cols-8 gap-4">
      <Link
        className="font-semibold text-lg col-span-2 cursor-pointer text-black underline hover:text-blue-primary h-fit"
        href={`/concept/${ontologySlug}-${focusNodeName}`}
        color="primary"
      >
        {focusNodeName
          ?.replaceAll('-', ' ')
          .replace(/^\w/, (c) => c.toUpperCase())}
      </Link>
      <div className="space-y-2 col-span-6">
        {severityGroups.map(([severity, results], idx) => (
          <div
            key={idx}
            className={clsx(
              'p-2.5 rounded-lg border z-100',
              severity === 'ERROR' &&
                'border-status-error-600 bg-status-error-600/10',
              severity === 'WARNING' &&
                'border-status-warning bg-status-warning/10',
              severity === 'INFO' && 'border-blue-primary bg-blue-primary/10',
            )}
          >
            <div className="flex gap-2 items-start flex-col">
              <GovTag
                type="bold"
                size="xs"
                color={
                  severity === 'ERROR'
                    ? 'error'
                    : severity === 'WARNING'
                      ? 'warning'
                      : 'primary'
                }
              >
                {t(severity)}
              </GovTag>
              <ul className="flex-1 space-y-1 list-disc ml-5">
                {results.map((result, resultIdx) => (
                  <li key={resultIdx} className="text-sm">
                    {result.message || result.severity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
