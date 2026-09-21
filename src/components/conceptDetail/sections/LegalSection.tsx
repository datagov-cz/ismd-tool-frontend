import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import {
  NonLegalSourceDto,
  ResolvedLegalSourceDto,
  useResolveLegalSource,
} from '@/api/generated';
import { Section } from '../Section';

export const LegalSection = ({
  definujiciUstanoveni,
  souvisejiciUstanoveni,
  definujícíZdroj,
  souvisejícíZdroj,
}: {
  definujiciUstanoveni?: ResolvedLegalSourceDto[];
  souvisejiciUstanoveni?: ResolvedLegalSourceDto[];
  definujícíZdroj?: NonLegalSourceDto[];
  souvisejícíZdroj?: NonLegalSourceDto[];
}) => {
  const t = useTranslations('ConceptDetail');

  const hasContent =
    (definujiciUstanoveni?.length ?? 0) > 0 ||
    (souvisejiciUstanoveni?.length ?? 0) > 0 ||
    (definujícíZdroj?.length ?? 0) > 0 ||
    (souvisejícíZdroj?.length ?? 0) > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="bg-surface px-4 py-3 rounded-md shadow-subtle">
      {definujiciUstanoveni && definujiciUstanoveni.length > 0 && (
        <Section title={t('Sections.Resource')}>
          <div className="space-y-2">
            {definujiciUstanoveni.map((item) => {
              return <LegislativeSource item={item} key={item.lawIri} />;
            })}
          </div>
        </Section>
      )}

      {souvisejiciUstanoveni && souvisejiciUstanoveni.length > 0 && (
        <Section title={t('Sections.RelatedResources')}>
          <div className="space-y-2">
            {souvisejiciUstanoveni.map((item) => {
              return <LegislativeSource item={item} key={item.lawIri} />;
            })}
          </div>
        </Section>
      )}

      {definujícíZdroj && definujícíZdroj.length > 0 && (
        <Section title={t('Sections.NonLegalResources')}>
          {definujícíZdroj.map((item) => {
            return (
              <NonLegislativeSource
                name={item['název']?.cs}
                description={item.popis?.cs}
                url={item.url}
                key={item.iri}
              />
            );
          })}
        </Section>
      )}

      {souvisejícíZdroj && souvisejícíZdroj.length > 0 && (
        <Section title={t('Sections.RelatedNonLegalResources')}>
          {souvisejícíZdroj.map((item) => {
            return (
              <NonLegislativeSource
                name={item['název']?.cs}
                description={item.popis?.cs}
                url={item.url}
                key={item.iri}
              />
            );
          })}
        </Section>
      )}
    </div>
  );
};

export const NonLegislativeSource = ({
  name,
  description,
  url,
}: {
  name?: string;
  description?: string;
  url?: string;
}) => {
  return (
    <div className="px-4 py-2 border rounded-lg border-gray-border flex flex-col gap">
      <span className="text-sm font-bold">{name}</span>
      <span className="text-xs">{description}</span>
      <Link href={url || ''} className="text-sm font-bold hover:underline">
        {url}
      </Link>
    </div>
  );
};

interface LegislativeSourceProps {
  item: ResolvedLegalSourceDto;
  bg?: 'white' | 'blue';
}

export const LegislativeSource = ({
  item,
  bg = 'blue',
}: LegislativeSourceProps) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations('ConceptDetail');

  const { data } = useResolveLegalSource({
    iri: item.fragmentIri ?? item.originalUrl ?? '',
  });

  return (
    <div
      className={clsx(
        'border rounded-lg border-border-primary px-2 py-1',
        bg === 'white' ? 'bg-surface ' : 'bg-surface-page',
      )}
    >
      <button
        type="button"
        className="w-full flex justify-between items-center gap-2"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <GovIcon type="components" name="book" color="neutral" />
          <span className="font-medium text-start break-normal">
            {data?.data?.displayLabel ?? item.displayLabel}
          </span>
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
        <div className="pt-3">
          <div
            className="border-y p-4 border-gray-border"
            dangerouslySetInnerHTML={{
              __html:
                data?.data?.fragmentBodyHtml ??
                item.fragmentBodyHtml ??
                item.fragmentIri ??
                item.originalUrl ??
                '',
            }}
          />

          <GovButton
            color="primary"
            type="base"
            size="xs"
            href={data?.data?.domain}
            iconStart={<GovIcon name="box-arrow-up-right" type="components" />}
          >
            {t('Main.OpenInESbirka')}
          </GovButton>
        </div>
      )}
    </div>
  );
};
