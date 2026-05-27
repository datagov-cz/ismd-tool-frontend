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

  if (
    !definujiciUstanoveni &&
    !souvisejiciUstanoveni &&
    !definujícíZdroj &&
    !souvisejícíZdroj
  ) {
    return null;
  }

  return (
    <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
      {definujiciUstanoveni && (
        <Section title={t('Sections.Resource')}>
          <div className="space-y-2">
            {definujiciUstanoveni.map((item) => {
              return <LegislativeSource item={item} key={item.lawIri} />;
            })}
          </div>
        </Section>
      )}

      {souvisejiciUstanoveni && (
        <Section title={t('Sections.RelatedResources')}>
          <div className="space-y-2">
            {souvisejiciUstanoveni.map((item) => {
              return <LegislativeSource item={item} key={item.lawIri} />;
            })}
          </div>
        </Section>
      )}

      {definujícíZdroj && (
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

      {souvisejícíZdroj && (
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
}

export const LegislativeSource = ({ item }: LegislativeSourceProps) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations('ConceptDetail');

  const { data } = useResolveLegalSource(
    { iri: item.fragmentIri ?? '' },
    { query: { enabled: !!item.fragmentIri && open } },
  );

  return (
    <div className="border border-gray-border rounded-lg bg-status-warning-100 px-2 py-1">
      <button
        type="button"
        className="w-full flex justify-between items-center gap-2"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <GovIcon type="components" name="book" color="neutral" />
          <span className="font-medium text-start">{item.displayLabel}</span>
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
          {data?.data?.fragmentBodyHtml && (
            <div
              className="border-y p-4 border-gray-border"
              dangerouslySetInnerHTML={{
                __html: data.data.fragmentBodyHtml,
              }}
            />
          )}

          <GovButton
            color="primary"
            type="base"
            size="xs"
            href={data?.data?.domain}
          >
            <GovIcon
              name="box-arrow-up-right"
              type="components"
              slot="icon-start"
            />
            {t('Main.OpenInESbirka')}
          </GovButton>
        </div>
      )}
    </div>
  );
};
