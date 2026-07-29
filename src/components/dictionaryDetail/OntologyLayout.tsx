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
      <div className="w-full max-w-250 mx-auto py-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-2">
          <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center relative">
            <GovButton
              type="base"
              color="primary"
              size="s"
              onGovClick={() => router.back()}
              className="lg:absolute lg:top-1/2 lg:left-0 lg:-ml-2 lg:-translate-x-full lg:-translate-y-1/2 px-0! lg:px-4!"
            >
              <GovIcon slot="icon-start" name="chevron-left" size="m" />
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
              >
                <GovIcon
                  slot="icon-start"
                  name="journal-text"
                  size="l"
                  className="text-white"
                />
                <span
                  className={clsx(!isPublished && 'text-status-warning-700!')}
                >
                  {t('Main.Ontology')}
                </span>
                <span
                  className={clsx(!isPublished && 'text-status-warning-700')}
                >
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
          </div>

          <h1 className="text-[32px] font-medium">
            {title?.cs || title?.en || title?.sk}
          </h1>

          {(title?.en || title?.sk) && (
            <Section title={t('Main.Name')}>
              <LanguageSwitcher item={title} hideCs />
            </Section>
          )}

          {popis ? (
            <Section title={t('Main.Description')}>
              <LanguageSwitcher item={popis} />
            </Section>
          ) : (
            <p className="text-md">{fallbackPopis}</p>
          )}
        </div>

        <div className="lg:col-span-1">{children}</div>
      </div>
      <div className="w-full bg-primary-subtlest flex-1 h-full px-5">
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
                >
                  <GovIcon
                    slot="icon-start"
                    name="plus"
                    size="s"
                    className="text-white"
                  />
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
                          'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
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
                    className="max-w-60 w-full border-0!"
                    size="s"
                    placeholder={t('Main.SearchConcepts')}
                    value={filterQuery}
                    onGovInput={(e) => setFilterQuery(e.detail.value ?? '')}
                  >
                    <GovIcon
                      type="components"
                      color="neutral"
                      name="funnel"
                      slot="icon-start"
                      size="s"
                      className="transition-transform duration-200"
                    />
                  </GovFormInput>
                </GovFormGroup>
              </div>
            </div>
            <div className="space-y-2">
              {filteredParentTerms.length === 0 && concepts?.length !== 0 && (
                <div className="bg-white rounded-xl py-10 items-center justify-center border border-border-grey overflow-hidden shadow-subtle flex flex-col">
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
            <div className="order-first lg:order-none lg:col-span-1 flex flex-col gap-10 lg:sticky lg:top-24 self-start">
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
