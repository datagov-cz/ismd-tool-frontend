import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import type { PrefilledLegalSource } from '@/hooks/useLegalSourcePrefill';

type Props = {
  prefilled: PrefilledLegalSource;
};

const scrollToAnchor = (anchor: string) =>
  document
    .getElementById(anchor)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });

export const PrefilledSummary = ({ prefilled }: Props) => {
  const t = useTranslations('CreateConcept.LegalSourceAutofill');
  const tLabels = useTranslations('CreateConcept.CommonConceptFields.Labels');

  const rows = [
    ...(prefilled.definition
      ? [
          {
            label: tLabels('Definition'),
            anchor: 'definition',
            value: (
              <span className="text-sm line-clamp-2 text-muted">
                {prefilled.definition}
              </span>
            ),
          },
        ]
      : []),
    {
      label: tLabels('DefiningLegalSource'),
      anchor: 'definingLegalSource',
      value: (
        <span className="flex min-w-0 flex-col items-start text-left">
          <span className="block w-full truncate text-sm leading-4 text-muted">
            {prefilled.legalSourceLabel}
          </span>
          <span className="block w-full truncate text-sm font-semibold leading-5">
            {prefilled.legalSourceBody}
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="px-2.5 space-y-2">
      <div className="text-sm font-semibold">{t('PrefilledSummary')}</div>
      <ul className="flex flex-col divide-y divide-border-subtle rounded-lg border border-border-subtle bg-success-subtlest">
        {rows.map((row) => (
          <li
            key={row.anchor}
            className="grid h-14 grid-cols-[auto_minmax(0,1fr)_minmax(0,2fr)_auto] items-center gap-2 px-2.5"
          >
            <span className="flex items-center justify-center rounded-full border border-success p-0.5 text-success">
              <GovIcon type="components" name="check-lg" size="xs" />
            </span>
            <span className="font-semibold text-sm">{row.label}</span>
            <div className="min-w-0">{row.value}</div>
            <button
              type="button"
              className="shrink-0 cursor-pointer flex items-center"
              onClick={() => scrollToAnchor(row.anchor)}
            >
              <GovIcon type="components" name="eye" size="m" color="primary" />
            </button>
          </li>
        ))}
      </ul>
      <div className="text-base my-4">{t('PrefilledDetail')}</div>
    </div>
  );
};
