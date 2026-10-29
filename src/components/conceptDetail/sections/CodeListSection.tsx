import { GovIcon, GovTag } from '@gov-design-system-ce/react';
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

  return (
    <Section title={t('Sections.InstantiatedByCodeList')}>
      <div className="flex flex-col gap-1">
        {title && (
          <span className="font-bold">
            {datasetIri ? (
              <ExternalLink href={datasetIri} label={title} />
            ) : (
              title
            )}
          </span>
        )}
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
          <span className="text-sm">
            {t('CodeList.CodeListIri')}:{' '}
            <ExternalLink href={codeListIri} label={codeListIri} />
          </span>
        )}
        {datasetIri && (
          <span className="text-sm">
            {t('CodeList.DatasetIri')}:{' '}
            <ExternalLink href={datasetIri} label={datasetIri} />
          </span>
        )}
      </div>
    </Section>
  );
};
