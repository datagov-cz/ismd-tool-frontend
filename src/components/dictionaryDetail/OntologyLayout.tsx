import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';
import { LanguageSwitcher } from '@/components/conceptDetail/LanguageSwitcher';
import { GridContainer } from '@/components/dictionaryDetail/GridContainer';
import { Term } from '@/components/dictionaryDetail/Term';

export interface TermWithSlug {
  data: ConceptDetailModel;
  slug: string;
}

interface Props {
  title: string;
  popis?: Record<string, string> | null;
  fallbackPopis?: string;
  statusLabel?: string;
  sortedParentTerms: ConceptDetailModel[];
  getConceptSlug: (_concept: ConceptDetailModel) => string;
  getRelatedTerms: (_concept: ConceptDetailModel) => TermWithSlug[];
  children?: React.ReactNode;
}

export const OntologyLayout = ({
  title,
  popis,
  fallbackPopis,
  statusLabel,
  sortedParentTerms,
  getConceptSlug,
  getRelatedTerms,
  children,
}: Props) => {
  const t = useTranslations('DictionaryDetail');

  return (
    <div className="w-full relative flex max-w-250 mx-auto py-10">
      <div className="w-full pl-2 pr-8 space-y-6 relative">
        <GridContainer>
          <div className="space-y-2 col-span-4 col-start-2">
            <h1 className="text-xl lg:text-3xl font-bold">{title}</h1>
            {statusLabel && (
              <p className="text-sm text-dark-secondary">{statusLabel}</p>
            )}
          </div>
        </GridContainer>
        <GridContainer>
          <p className="font-medium text-xl">
            {t('Main.Sections.Description')}
          </p>
          {popis ? (
            <div className="col-span-4">
              <LanguageSwitcher item={popis} />
            </div>
          ) : fallbackPopis ? (
            <p className="col-span-4">{fallbackPopis}</p>
          ) : null}
        </GridContainer>
        <GridContainer>
          <p className="font-medium text-xl">{t('Main.Sections.Terms')}</p>
          <div className="col-span-4">
            {sortedParentTerms.map((concept, index) => (
              <Term
                data={concept}
                subterms={getRelatedTerms(concept)}
                key={concept.iri || index}
                slug={getConceptSlug(concept)}
              />
            ))}
          </div>
        </GridContainer>
      </div>
      {children}
    </div>
  );
};
