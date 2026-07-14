import { useEffect, useRef, useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import {
  ConceptDetailModel,
  GetOntologyDtoPublishedConceptDeviations,
} from '@/api/generated';

export type TermProps = {
  data: ConceptDetailModel;
  subterms?: { data: ConceptDetailModel; slug: string }[];
  tree?: boolean;
  slug?: string;
  filterQuery?: string;
  deviations?: GetOntologyDtoPublishedConceptDeviations;
};

const fieldLabel = (key: string) =>
  key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');

const getDeviation = (
  deviations: GetOntologyDtoPublishedConceptDeviations | undefined,
  iri?: string,
) => {
  if (!deviations || !iri) return null;
  const entry = deviations[iri];
  if (!entry || entry.status === 'NO_DEVIATION') return null;
  return entry;
};

type DeviationEntry = NonNullable<ReturnType<typeof getDeviation>>;

type DeviatedItem = {
  data: ConceptDetailModel;
  slug: string;
  deviation: DeviationEntry;
};

const changedFields = (deviation: DeviationEntry) =>
  Object.keys(deviation).filter(
    (key) => key !== 'status' && key !== 'errorMessage',
  );

const DeviationFooter = ({ items }: { items: DeviatedItem[] }) => {
  const t = useTranslations('DictionaryDetail.Deviations');

  if (items.length === 0) return null;

  return (
    <div className="-mx-3 -mb-2 mt-3 bg-[#FDF6D9] px-3 py-3">
      <p className="flex items-center gap-1.5 font-medium text-sm text-dark-secondary pl-1">
        <GovIcon
          name="info-circle"
          size="s"
          className="text-status-warning-600"
        />
        {t('FooterTitle')}
      </p>

      <div className="flex flex-col">
        {items.map((item, index) => {
          const fields = changedFields(item.deviation);
          const hasError = item.deviation.status !== 'HAS_DEVIATIONS';
          const href = `${process.env.NEXT_PUBLIC_BASE_PATH}/concept/${item.slug}`;

          return (
            <div
              key={item.data.iri || index}
              className={clsx(
                'flex gap-2 ml-8 py-2',
                index !== items.length - 1 && 'border-b border-black/10',
              )}
            >
              <div className="min-w-0">
                {items.length > 1 && (
                  <div className="flex gap-1">
                    <span className="text-sm text-black">{t('LocatedIn')}</span>
                    <a
                      href={href}
                      className="text-card-description font-bold text-sm hover:underline block truncate"
                    >
                      {item.data.název?.cs}
                    </a>
                  </div>
                )}
                {hasError ? (
                  <p className="text-sm text-black">
                    {item.deviation.errorMessage || t('VerifyError')}
                  </p>
                ) : (
                  <p className="text-sm text-black">
                    {t('CheckChanges')}
                    {fields.map((field, i) => (
                      <span key={field}>
                        <a
                          href={href}
                          className="font-medium text-sm underline hover:no-underline"
                        >
                          {fieldLabel(field)}
                        </a>
                        {i !== fields.length - 1 && ', '}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Highlight = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="underline decoration-dashed underline-offset-2 bg-warning decoration-blue-button-active">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
};

const TruncatedDefinice = ({ text }: { text: string }) => {
  const t = useTranslations('Term');
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setIsTruncated(el.scrollHeight > el.clientHeight);
  }, [text]);

  return (
    <p
      className={clsx(
        'text-sm mt-0.5 text-card-description',
        !expanded && 'flex',
      )}
    >
      <span ref={textRef} className={clsx(!expanded && 'line-clamp-1')}>
        {text}
      </span>
      {(isTruncated || expanded) && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="ml-1 text-blue-button-active hover:underline text-xs font-medium shrink-0"
        >
          {expanded ? t('ShowLess') : t('ShowMore')}
        </button>
      )}
    </p>
  );
};

type SubtermRowProps = {
  item: { data: ConceptDetailModel; slug: string };
  isLast: boolean;
  filterQuery?: string;
};

const SubtermRow = ({ item, isLast, filterQuery }: SubtermRowProps) => {
  const name = item.data.název?.cs ?? '';

  return (
    <div
      className="relative flex items-start pl-4 scroll-mt-24"
      id={item.data.iri}
    >
      <span
        className={`absolute left-0 top-0 w-px bg-blue-primary/30 ${isLast ? 'h-3.5' : 'h-full'}`}
      />
      <span className="absolute left-0 top-3.5 w-2 h-px bg-blue-primary/30" />

      <div className="leading-snug py-0.5">
        <a
          href={`${process.env.NEXT_PUBLIC_BASE_PATH}/concept/${item.slug}`}
          className="text-blue-button-active font-bold hover:underline"
        >
          <Highlight text={name} query={filterQuery ?? ''} />
        </a>
        {(item.data.definice?.cs || item.data.popis?.cs) && (
          <TruncatedDefinice
            text={item.data.definice?.cs || item.data.popis?.cs || ''}
          />
        )}
      </div>
    </div>
  );
};

type SubtermGroupProps = {
  label: string;
  items: { data: ConceptDetailModel; slug: string }[];
  isLast?: boolean;
  filterQuery?: string;
};

const SubtermGroup = ({
  label,
  items,
  isLast,
  filterQuery,
}: SubtermGroupProps) => {
  if (items.length === 0) return null;

  return (
    <div className="relative pl-6.5">
      <span
        className={clsx(
          `absolute left-2.5 w-px bg-blue-primary/30`,
          isLast ? 'top-0 h-2.5' : 'top-0 bottom-0',
        )}
      />

      <p className="text-sm text-black font-medium mb-1.5 relative">
        <span className="absolute -left-4 top-1/2 w-2 h-px bg-blue-primary/30" />
        {label}
      </p>

      <div className="flex flex-col">
        {items.map((item, index) => (
          <SubtermRow
            key={item.data.iri || index}
            item={item}
            isLast={index === items.length - 1}
            filterQuery={filterQuery}
          />
        ))}
      </div>
    </div>
  );
};

export const Term = ({
  data,
  subterms,
  slug,
  filterQuery,
  deviations,
}: TermProps) => {
  const t = useTranslations('Term');

  const name = data.název?.cs;
  const capitalizedName = name && name.charAt(0).toUpperCase() + name.slice(1);

  const properties =
    subterms?.filter((item) => item.data.typ?.includes('Vlastnost')) ?? [];
  const relations =
    subterms?.filter((item) => item.data.typ?.includes('Vztah')) ?? [];

  const visibleGroups = [
    { label: t('Properties'), items: properties },
    { label: t('Relations'), items: relations },
  ].filter((g) => g.items.length > 0);

  const hasSubterms = visibleGroups.length > 0;

  const deviatedItems: DeviatedItem[] = [
    { data, slug: slug ?? '' },
    ...(subterms ?? []),
  ].flatMap((item) => {
    const deviation = getDeviation(deviations, item.data.iri);
    return deviation ? [{ ...item, deviation }] : [];
  });

  return (
    <div
      className="bg-white rounded-xl px-3 py-2 border border-border-grey overflow-hidden shadow-subtle flex flex-col scroll-m-24"
      id={data.iri}
    >
      <span className={clsx('relative flex gap-2', hasSubterms && 'pb-3')}>
        <GovIcon
          slot="icon-start"
          name={
            data.typ?.includes('Vlastnost')
              ? 'tag'
              : data.typ?.includes('Vztah')
                ? 'bezier2'
                : 'card-heading'
          }
          type="components"
          size="l"
          color="primary"
          className="mt-0.5! shrink-0"
        />
        <span>
          <a
            href={`${process.env.NEXT_PUBLIC_BASE_PATH}/concept/${slug}`}
            className="text-blue-button-active font-bold hover:underline"
          >
            <Highlight text={capitalizedName ?? ''} query={filterQuery ?? ''} />
          </a>
          {(data.definice?.cs || data.popis?.cs) && (
            <TruncatedDefinice
              text={data.definice?.cs || data.popis?.cs || ''}
            />
          )}
        </span>

        {hasSubterms && (
          <span className="absolute left-2.5 top-6 bottom-0 w-px bg-blue-primary/30" />
        )}
      </span>

      {hasSubterms && (
        <div className="flex flex-col">
          {visibleGroups.map((group, index) => (
            <SubtermGroup
              key={group.label}
              label={group.label}
              items={group.items}
              isLast={index === visibleGroups.length - 1}
              filterQuery={filterQuery}
            />
          ))}
        </div>
      )}

      <DeviationFooter items={deviatedItems} />
    </div>
  );
};
