import { useMemo, useState } from 'react';
import {
  GovFormGroup,
  GovFormInput,
  GovIcon,
  GovTag,
} from '@gov-design-system-ce/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel, OntologyDetailModelNázev } from '@/api/generated';
import { Term } from '@/components/dictionaryDetail/Term';
import { LanguageSwitcher } from '../conceptDetail/LanguageSwitcher';
import { Section } from '../conceptDetail/Section';

export interface TermWithSlug {
  data: ConceptDetailModel;
  slug: string;
}

interface Props {
  title?: OntologyDetailModelNázev;
  popis?: Record<string, string> | null;
  concepts?: ConceptDetailModel[];
  getConceptSlug: (_concept: ConceptDetailModel) => string;
  conceptCount?: number;
}

export const DatasetLayout = ({
  title,
  popis,
  concepts,
  getConceptSlug,
  conceptCount,
}: Props) => {
  const t = useTranslations('DictionaryDetail');

  const [filterQuery, setFilterQuery] = useState('');

  const router = useRouter();

  const filteredConcepts = useMemo(() => {
    if (!filterQuery.trim()) {
      return concepts;
    }

    const q = filterQuery.toLowerCase();

    return concepts?.filter((concept) =>
      concept.název?.cs?.toLowerCase().includes(q),
    );
  }, [concepts, filterQuery]);

  return (
    <div className="w-full h-full flex-1">
      <div className="w-full bg-white">
        <div className="w-full max-w-250 mx-auto px-5 desktop:px-0 py-5 flex flex-col gap-5 ">
          <div className="flex flex-wrap gap-2 items-center relative">
            <button
              type="button"
              color="primary"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-blue-primary font-bold"
            >
              <GovIcon slot="icon-start" name="chevron-left" size="m" />
              {t('Main.BackToHome')}
            </button>
          </div>

          <div className="">
            <div className="flex flex-col gap-2">
              <h1 className="text-[32px] font-medium">
                {title?.cs || title?.en || title?.sk}
              </h1>

              {(title?.en || title?.sk) && (
                <Section title={t('Main.Name')}>
                  <LanguageSwitcher item={title} hideCs />
                </Section>
              )}

              <div className="text-gray font-bold">
                {popis && Object.keys(popis).length > 0 && (
                  <LanguageSwitcher item={popis} />
                )}
              </div>

              <div className="flex flex-row justify-between items-center">
                <GovTag type="subtle" color="primary">
                  <GovIcon name="database" />
                  <span className="font-bold">Datova sada NKD</span>
                </GovTag>

                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-primary-subtlest flex-1 h-full px-5">
        <div className="w-full max-w-250 mx-auto py-3 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <div className={'lg:col-span-3'}>
            <p className="font-medium text-lg mb-3">
              {t('Main.Sections.Terms')}{' '}
              <span className="opacity-60">
                [{conceptCount ?? concepts?.length ?? 0}]
              </span>
            </p>
            <div className="flex justify-between pb-2 items-end gap-4">
              <div className="flex items-center gap-4">
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
              {filteredConcepts?.length === 0 && concepts?.length !== 0 && (
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
              {filteredConcepts?.map((concept, index) => (
                <Term
                  data={concept}
                  key={concept.iri || index}
                  slug={getConceptSlug(concept)}
                  filterQuery={filterQuery}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
