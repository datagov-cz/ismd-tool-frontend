import { useMemo, useState } from 'react';
import {
  GovButton,
  GovFormGroup,
  GovFormInput,
  GovIcon,
  GovTag,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  ConceptDetailModel,
  GetOntologyDtoPublishedConceptDeviations,
  OntologyDetailModelNázev,
  OntologyMetadataModel,
} from '@/api/generated';
import { Term } from '@/components/dictionaryDetail/Term';
import { LanguageSwitcher } from '../conceptDetail/LanguageSwitcher';
import { Section } from '../conceptDetail/Section';
import { useCurrentUser } from '../contexts/CurrentUserProvider';

import { DeviationSidebarCard } from './DeviationSidebarCard';
import { ValidationSummary } from './validation/ValidationSummary';

export interface TermWithSlug {
  data: ConceptDetailModel;
  slug: string;
}

interface Props {
  title?: OntologyDetailModelNázev;
  popis?: Record<string, string> | null;
  source: 'NKD' | 'ISMD';
  fallbackPopis?: string;
  statusLabel?: string;
  concepts?: ConceptDetailModel[];
  getConceptSlug: (_concept: ConceptDetailModel) => string;
  getRelatedTerms: (_concept: ConceptDetailModel) => TermWithSlug[];
  children?: React.ReactNode;
  conceptCount?: number;
  metaData?: OntologyMetadataModel;
  slug?: string;
  deviations?: GetOntologyDtoPublishedConceptDeviations;
  isPublished?: boolean;
  updatedAt?: string;
}

export const OntologyLayout = ({
  title,
  popis,
  fallbackPopis,
  statusLabel,
  concepts,
  getConceptSlug,
  getRelatedTerms,
  children,
  source,
  conceptCount,
  slug,
  metaData,
  deviations,
  isPublished,
  updatedAt,
}: Props) => {
  const t = useTranslations('DictionaryDetail');

  const { user, isAdmin } = useCurrentUser();

  const [filterQuery, setFilterQuery] = useState('');
  const [showDeviations, setShowDeviations] = useState(true);

  const router = useRouter();

  const hasDeviations =
    source === 'ISMD' &&
    !!deviations &&
    Object.values(deviations).some((entry) => entry.status !== 'NO_DEVIATION');

  const visibleDeviations =
    hasDeviations && showDeviations ? deviations : undefined;

  const filteredParentTerms = useMemo(() => {
    const conceptIris = new Set(concepts?.map((c) => c.iri).filter(Boolean));

    const allParents =
      concepts
        ?.filter((item) => item.název)
        ?.filter(
          (item) =>
            !item['definiční-obor'] || !conceptIris.has(item['definiční-obor']),
        )
        .sort((a, b) => (a.název?.cs ?? '').localeCompare(b.název?.cs ?? '')) ??
      [];

    if (!filterQuery.trim()) {
      return allParents.map((concept) => ({
        concept,
        subterms: getRelatedTerms(concept),
      }));
    }

    const q = filterQuery.toLowerCase();

    return allParents
      .map((concept) => {
        const allSubterms = getRelatedTerms(concept);
        const nameMatch = concept.název?.cs?.toLowerCase().includes(q);
        const filteredSubterms = allSubterms.filter((sub) =>
          sub.data.název?.cs?.toLowerCase().includes(q),
        );

        return {
          concept,
          subterms: nameMatch ? allSubterms : filteredSubterms,
        };
      })
      .filter(
        ({ concept, subterms }) =>
          concept.název?.cs?.toLowerCase().includes(q) || subterms.length > 0,
      );
  }, [concepts, filterQuery, getRelatedTerms]);

  const isLoggedOutOrNKD =
    (user?.userId !== metaData?.user?.userId || source === 'NKD') &&
    (!isAdmin || source === 'NKD');

  const showValidationSummary = !isLoggedOutOrNKD && !!slug && !!metaData;
  const hasSidebar = !!visibleDeviations || showValidationSummary;

  return (
    <div className="w-full h-full flex-1">
      <div className="w-full max-w-250 mx-auto px-5 desktop:px-0 py-5 flex flex-col gap-5">
        <div className="flex flex-wrap gap-2 items-center relative">
          <GovButton
            type="base"
            color="primary"
            size="s"
            onClick={() => router.back()}
            className="desktop:absolute desktop:top-1/2 desktop:left-0 desktop:-ml-2 desktop:-translate-x-full desktop:-translate-y-1/2 px-0! desktop:px-4!"
            iconStart={<GovIcon name="chevron-left" size="m" />}
          >
            {t('Main.BackToHome')}
          </GovButton>

          <Link
            href={`/dictionary${source === 'NKD' ? '/nkd' : ''}/list`}
            className="cursor-pointer! hover:underline"
          >
            <GovTag
              color={isPublished ? 'success' : 'secondary'}
              size="xs"
              type="subtle"
              className="w-fit [&_span]:font-bold! [&_span]:cursor-pointer!"
              iconStart={
                <GovIcon name="journal-text" size="l" className="text-white" />
              }
            >
              <span
                className={clsx(!isPublished && 'text-status-warning-700!')}
              >
                {t('Main.Ontology')}
              </span>
              <span className={clsx(!isPublished && 'text-status-warning-700')}>
                {`/ ${source}`}
              </span>
              {statusLabel && (
                <span
                  className={clsx(!isPublished && 'text-status-warning-700')}
                >
                  {`/ ${statusLabel}`}
                </span>
              )}
            </GovTag>
          </Link>

          {updatedAt && (
            <span className="ml-auto text-sm font-semibold text-foreground whitespace-nowrap">
              {t('Main.ControlPanel.Updated')}:{' '}
              {new Date(updatedAt).toLocaleDateString('CS')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 tablet:col-span-9 desktop:col-span-8 flex flex-col gap-2">
            <h1 className="text-h1 font-medium">
              {title?.cs || title?.en || title?.sk}
            </h1>

            {(title?.en || title?.sk) && (
              <Section title={t('Main.Name')}>
                <LanguageSwitcher item={title} hideCs />
              </Section>
            )}

            {popis && Object.keys(popis).length > 0 ? (
              <Section title={t('Main.Description')}>
                <LanguageSwitcher item={popis} />
              </Section>
            ) : (
              <p className="text-md">{fallbackPopis}</p>
            )}
          </div>

          <div className="col-span-12 tablet:col-span-3 desktop:col-span-4">
            {children}
          </div>
        </div>
      </div>
      <div className="w-full bg-surface-page flex-1 h-full px-5">
        <div className="w-full max-w-250 mx-auto py-3 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <div className={hasSidebar ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <p className="font-medium text-lg mb-3">
              {t('Main.Sections.Terms')}{' '}
              <span className="opacity-60">[{conceptCount}]</span>
            </p>
            <div className="flex justify-between pb-2 items-end gap-4">
              {!isLoggedOutOrNKD && (
                <GovButton
                  type="solid"
                  color="primary"
                  size="s"
                  href={`${process.env.NEXT_PUBLIC_BASE_PATH}/concept/create?ontology=${slug}`}
                  iconStart={
                    <GovIcon name="plus" size="s" className="text-white" />
                  }
                >
                  {t('Main.AddConcept')}
                </GovButton>
              )}

              <div className="flex items-center gap-4 ml-auto">
                {hasDeviations && (
                  <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showDeviations}
                      onClick={() => setShowDeviations((v) => !v)}
                      className={clsx(
                        'relative h-5 w-9 rounded-full transition-colors duration-200 shrink-0 cursor-pointer',
                        showDeviations
                          ? 'bg-status-warning-600'
                          : 'bg-black/25',
                      )}
                    >
                      <span
                        className={clsx(
                          'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-surface shadow transition-transform duration-200',
                          showDeviations && 'translate-x-4',
                        )}
                      />
                    </button>
                    <span className="text-sm">
                      {t('Deviations.ToggleLabel')}
                    </span>
                  </label>
                )}

                <GovFormGroup className="relative w-full max-w-60">
                  <GovFormInput
                    identifier="ontology-concept-filter"
                    className="max-w-60 w-full border-0!"
                    size="s"
                    placeholder={t('Main.SearchConcepts')}
                    value={filterQuery}
                    onChange={(e) =>
                      setFilterQuery(e.currentTarget.value ?? '')
                    }
                    iconStart={
                      <GovIcon
                        type="components"
                        color="neutral"
                        name="funnel"
                        size="s"
                        className="transition-transform duration-200"
                      />
                    }
                  />
                </GovFormGroup>
              </div>
            </div>
            <div className="space-y-2">
              {filteredParentTerms.length === 0 && concepts?.length !== 0 && (
                <div className="bg-surface rounded-xl py-10 items-center justify-center border border-border-default overflow-hidden shadow-subtle flex flex-col">
                  <span className="text-xl font-bold text-status-error-600 pb-2">
                    {t('Main.NoResults.Title')}
                  </span>
                  <span>
                    {t.rich('Main.NoResults.Description', {
                      query: filterQuery,
                      strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </span>
                </div>
              )}
              {filteredParentTerms.map(({ concept, subterms }, index) => (
                <Term
                  data={concept}
                  subterms={subterms}
                  key={concept.iri || index}
                  slug={getConceptSlug(concept)}
                  filterQuery={filterQuery}
                  deviations={visibleDeviations}
                />
              ))}
            </div>
          </div>
          {hasSidebar && (
            <div className="order-first lg:order-0 lg:col-span-1 flex flex-col gap-10 lg:sticky lg:top-24 self-start">
              {visibleDeviations && (
                <DeviationSidebarCard
                  deviations={visibleDeviations}
                  concepts={concepts}
                />
              )}
              {showValidationSummary && (
                <ValidationSummary slug={slug} metaData={metaData} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
