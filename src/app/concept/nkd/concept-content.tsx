'use client';

import { GovButton } from '@gov-design-system-ce/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useGetNkdConceptDetail } from '@/api/generated';
import { ConceptHeaderNKD } from '@/components/conceptDetail/ConceptHeaderNKD';
import { ConceptLayout } from '@/components/conceptDetail/ConceptLayout';
import { OtherOntologyConcepts } from '@/components/conceptDetail/OtherOntologyConcepts';
import { CircularLoader } from '@/components/shared/CircularLoader';

interface Props {
  slug: string;
}

export const ConceptContentNKD = ({ slug }: Props) => {
  const concept = useGetNkdConceptDetail({ iri: slug });
  const router = useRouter();
  const t = useTranslations('ConceptDetail.Main.ControlPanel');

  if (concept.isLoading)
    return (
      <div className="h-full flex items-center justify-center w-full">
        <CircularLoader />
      </div>
    );

  if (!concept.data)
    return (
      <div className="w-full h-full flex items-center justify-center flex-1 flex-col gap-2">
        <h1 className="text-2xl">{t('NotFound')}</h1>
        <GovButton
          type="solid"
          color="primary"
          onGovClick={() => router.back()}
        >
          {t('Back')}
        </GovButton>
      </div>
    );

  const conceptDetail = concept.data.data?.conceptDetail;
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
        <OtherOntologyConcepts
          ontology={concept.data.data?.ontologyIri || ''}
          source="NKD"
        />
      </ConceptLayout>
    </>
  );
};
