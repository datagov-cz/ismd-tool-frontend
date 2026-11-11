import { useState } from 'react';
import { GovIcon, GovTag } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { CodeListDto, NkodCodelistCheckDto } from '@/api/generated';
import { Section } from '../Section';

interface Props {
  codeList?: CodeListDto;
  resolved?: NkodCodelistCheckDto;
}

const ExternalLink = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="text-accent underline break-all"
  >
    {label}
  </a>
);

export const CodeListSection = ({ codeList, resolved }: Props) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations('ConceptDetail');

  const codeListIri = resolved?.codelist?.codeListIri ?? codeList?.iri;
  const datasetIri =
    resolved?.codelist?.datasetIri ?? codeList?.['datová-sada-v-nkod'];

  if (!codeListIri && !datasetIri) {
    return null;
  }

  const item = resolved?.codelist;
  const title = item
    ? item.codeListNumber
      ? `${item.codeListNumber} - ${item.title}`
      : item.title
    : undefined;

  const status = resolved?.status;

  const statusLabel =
    status === 'NEW_VERSION'
      ? t('CodeList.NewVersion')
      : status === 'MISSING'
        ? t('CodeList.Missing')
        : undefined;
  const headerTitle = title ?? codeListIri ?? datasetIri;

  return (
    <Section title={t('Sections.InstantiatedByCodeList')}>
      <div className="border rounded-lg border-border-primary px-2 py-1 bg-surface-page">
        <button
          type="button"
          className="w-full flex justify-between items-center gap-2 text-start"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          <div className="flex items-center gap-2 min-w-0">
            <GovIcon type="components" name="book" color="neutral" />
            <span className="font-medium break-all">{headerTitle}</span>
          </div>
          <GovIcon
            type="components"
            name="chevron-down"
            color="primary"
            size="s"
            className={clsx(open && 'rotate-180')}
          />
        </button>

        {open && (
          <div className="pt-2">
            <div className="border-t p-4 border-gray-border flex flex-col gap-2">
              {item?.publisher && (
                <span className="text-sm text-foreground-muted">
                  {item.publisher}
                </span>
              )}
              {statusLabel && (
                <GovTag
                  color="warning"
                  type="subtle"
                  size="xs"
                  className="w-fit"
                  iconStart={
                    <GovIcon name="exclamation-triangle" type="components" />
                  }
                >
                  {statusLabel}
                </GovTag>
              )}
              {codeListIri && (
                <span className="text-sm flex flex-col">
                  <span className="font-bold">
                    {t('CodeList.CodeListIri')}:
                  </span>{' '}
                  <ExternalLink href={codeListIri} label={codeListIri} />
                </span>
              )}
              {datasetIri && (
                <span className="text-sm flex flex-col">
                  <span className="font-bold">{t('CodeList.DatasetIri')}:</span>{' '}
                  <ExternalLink href={datasetIri} label={datasetIri} />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
};
