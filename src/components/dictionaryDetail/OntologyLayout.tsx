import { useMemo, useState } from 'react';
import {
  GovButton,
  GovFormGroup,
  GovFormInput,
  GovIcon,
  GovTag,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import {
  ConceptDetailModel,
  OntologyMetadataModel,
  useGetCurrentUser,
} from '@/api/generated';
import { Term } from '@/components/dictionaryDetail/Term';

import { ValidationSummary } from './validation/ValidationSummary';

export interface TermWithSlug {
  data: ConceptDetailModel;
  slug: string;
}

interface Props {
  title: string;
  popis?: Record<string, string> | null;
  source: 'NKD' | 'ISMD';
  fallbackPopis?: string;
  statusLabel?: string;
  concepts?: ConceptDetailModel[];
  getConceptSlug: (_concept: ConceptDetailModel) => string;
  getRelatedTerms: (_concept: ConceptDetailModel) => TermWithSlug[];
  children?: React.ReactNode;
  updatedAt?: string;
  conceptCount?: number;
  metaData?: OntologyMetadataModel;
  slug?: string;
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
  updatedAt,
  conceptCount,
  slug,
  metaData,
}: Props) => {
  const t = useTranslations('DictionaryDetail');

  const { data } = useGetCurrentUser();

  const [filterQuery, setFilterQuery] = useState('');

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

  const isLoggedOutOrNKD = data?.success !== true || source === 'NKD';

  return (
    <div className="w-full h-full flex-1">
      <div className="w-full bg-primary-subtlest">
        <div className="w-full relative max-w-250 mx-auto pt-2 pb-3">
          <GovButton
            type="base"
            color="primary"
            size="s"
            href={process.env.NEXT_PUBLIC_BASE_PATH}
          >
            <GovIcon
              slot="icon-start"
              name="arrow-right"
              size="l"
              className="rotate-180"
            />
            {t('Main.BackToHome')}
          </GovButton>
        </div>
      </div>
      <div className="w-full relative max-w-250 mx-auto py-3">
        <div className="w-full space-y-6 relative">
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <div className="flex w-full justify-between">
                <GovTag
                  color="success"
                  size="xs"
                  type="subtle"
                  className="w-fit [&_span]:font-bold!"
                >
                  <GovIcon
                    slot="icon-start"
                    name="journal-text"
                    size="l"
                    className="text-white"
                  />
                  {t('Main.Ontology')}
                  <span> / {source}</span>
                  {statusLabel && <span> / {statusLabel}</span>}
                </GovTag>
                {updatedAt && (
                  <span className="text-sm text-dark-primary">
                    {t('Main.ControlPanel.Updated')}:{' '}
                    {new Date(updatedAt).toLocaleDateString('CS')}
                  </span>
                )}
              </div>
              <h1 className="text-[32px] font-medium">{title}</h1>
              <div>
                <p className="text-md">{popis?.cs ?? fallbackPopis}</p>
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
      <div className="w-full bg-primary-subtlest flex-1 h-full">
        <div className="w-full relative max-w-250 mx-auto py-3 grid grid-cols-10 ">
          <div
            className={clsx(isLoggedOutOrNKD ? 'col-span-10' : 'col-span-6')}
          >
            <p className="font-medium text-lg mb-3">
              {t('Main.Sections.Terms')}{' '}
              <span className="opacity-60">[{conceptCount}]</span>
            </p>
            <div className="flex justify-between pb-2 items-end">
              {!isLoggedOutOrNKD && (
                <GovButton type="solid" color="primary" size="s">
                  <GovIcon
                    slot="icon-start"
                    name="plus"
                    size="s"
                    className="text-white"
                  />
                  {t('Main.AddConcept')}
                </GovButton>
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
            <div className="col-span-4 space-y-2">
              {filteredParentTerms.map(({ concept, subterms }, index) => (
                <Term
                  data={concept}
                  subterms={subterms}
                  key={concept.iri || index}
                  slug={getConceptSlug(concept)}
                  filterQuery={filterQuery}
                />
              ))}
            </div>
          </div>
          {!isLoggedOutOrNKD && slug && metaData && (
            <ValidationSummary slug={slug} metaData={metaData} />
          )}
        </div>
      </div>
    </div>
  );
};
