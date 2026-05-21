'use client';

import { useGetNkdConceptDetail } from '@/api/generated';
import { ConceptHeaderNKD } from '@/components/conceptDetail/ConceptHeaderNKD';
import { ConceptLayout } from '@/components/conceptDetail/ConceptLayout';
import { OtherOntologyConcepts } from '@/components/conceptDetail/OtherOntologyConcepts';

interface Props {
  slug: string;
}

export const ConceptContentNKD = ({ slug }: Props) => {
  const concept = useGetNkdConceptDetail({ iri: slug });

  if (!concept.data) return null;

  const conceptDetail = concept.data.data?.conceptDetail;
  if (!conceptDetail) return null;

  const getType = () => {
    if (conceptDetail.typ?.includes('Třída')) return 'TRIDA';
    if (conceptDetail.typ?.includes('Vlastnost')) return 'VLASTNOST';
    if (conceptDetail.typ?.includes('Vztah')) return 'VZTAH';
  };

  return (
    <>
      <ConceptHeaderNKD ontology={''} conceptDetail={conceptDetail} />
      <ConceptLayout
        source="NKD"
        conceptDetail={conceptDetail}
        pathname=""
        conceptType={getType()}
      >
        <OtherOntologyConcepts
          ontology={concept.data.data?.ontologyIri || ''}
          source="NKD"
        />
      </ConceptLayout>
    </>
  );
};
