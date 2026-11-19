import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { OfnIssue } from '@/utils/ofnConformance';

interface Props {
  issues: OfnIssue[];
  conceptHref?: (_conceptIri: string) => string | undefined;
}

export const OfnIssuesList = ({ issues, conceptHref }: Props) => {
  const t = useTranslations('OfnConformance');
  const groups = new Map<string | null, OfnIssue[]>();

  for (const issue of issues) {
    const group = groups.get(issue.conceptIri) ?? [];
    group.push(issue);
    groups.set(issue.conceptIri, group);
  }

  return (
    <div className="space-y-4">
      {[...groups.entries()].map(([conceptIri, groupIssues]) => {
        const href = conceptIri ? conceptHref?.(conceptIri) : undefined;

        return (
          <section key={conceptIri ?? 'vocabulary'} className="space-y-2">
            <h3 className="font-semibold text-status-error-700">
              {conceptIri ? (
                href ? (
                  <Link href={href} className="text-accent underline break-all">
                    {conceptIri}
                  </Link>
                ) : (
                  <span className="break-all">{conceptIri}</span>
                )
              ) : (
                t('VocabularyLevel')
              )}
            </h3>
            <ul className="space-y-3">
              {groupIssues.map((issue, index) => (
                <li
                  key={`${issue.kind}-${issue.location}-${index}`}
                  className="border-l-2 border-status-error-600 pl-3 space-y-1.5"
                >
                  <p className="font-medium">{issue.message}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground-muted">
                    <span className="rounded bg-status-error-100 px-1.5 py-0.5 font-medium text-status-error-700">
                      {issue.kind}
                    </span>
                    <span className="break-all">{issue.location}</span>
                    {issue.value && (
                      <code className="rounded bg-surface-page px-1.5 py-0.5 break-all">
                        {issue.value}
                      </code>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
