'use client';

import { useTranslations } from 'next-intl';

import { useGetNkdConceptDetail } from '@/api/generated';
import { ConceptDatasetsList } from '@/components/conceptDetail/ConceptDatasetsList';
import { ConceptHeaderNKD } from '@/components/conceptDetail/ConceptHeaderNKD';
import { ConceptLayout } from '@/components/conceptDetail/ConceptLayout';
import { OtherOntologyConcepts } from '@/components/conceptDetail/OtherOntologyConcepts';
import { getPreferredTranslation } from '@/components/shared/DictionaryCard/DictionaryCard';
import { NotFoundState } from '@/components/shared/NotFoundState';
import { PageLoader } from '@/components/shared/PageLoader';
import { usePageTitle } from '@/hooks/usePageTitle';
import { isQueryLoading } from '@/lib/query';

interface Props {
  slug: string;
}

export const ConceptContentNKD = ({ slug }: Props) => {
  const concept = useGetNkdConceptDetail({ iri: slug });
  const t = useTranslations('ConceptDetail.Main.ControlPanel');
  const conceptDetail = concept.data?.data?.conceptDetail;
  usePageTitle('Pojem', getPreferredTranslation(conceptDetail?.název));

  if (isQueryLoading(concept)) {
    return <PageLoader />;
  }

  if (!concept.data) {
    return <NotFoundState title={t('NotFound')} backLabel={t('Back')} />;
  }

  if (!conceptDetail) return null;

  const getType = () => {
    if (conceptDetail.typ?.includes('Třída')) return 'TRIDA';
    if (conceptDetail.typ?.includes('Vlastnost')) return 'VLASTNOST';
    if (conceptDetail.typ?.includes('Vztah')) return 'VZTAH';
  };

  return (
    <>
      <ConceptHeaderNKD
        ontology={concept.data.data?.ontologyIri || ''}
        conceptDetail={conceptDetail}
      />
      <ConceptLayout
        source="NKD"
        conceptDetail={conceptDetail}
        conceptType={getType()}
        slug={slug}
        isOwnerLoggedIn={false}
      >
        <ConceptDatasetsList conceptIri={conceptDetail.iri} />
        <OtherOntologyConcepts
          ontology={concept.data.data?.ontologyIri || ''}
          source="NKD"
        />
      </ConceptLayout>
    </>
  );
};
