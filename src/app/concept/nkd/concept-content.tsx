'use client';

import { useGetNkdConceptDetail } from '@/api/generated';
import { ConceptLayout } from '@/components/conceptDetail/ConceptLayout';

interface Props {
  slug: string;
}

export const ConceptContentNKD = ({ slug }: Props) => {
  const concept = useGetNkdConceptDetail({ iri: slug });

  if (!concept.data) return null;

  const conceptDetail = concept.data.data?.conceptDetail;
  if (!conceptDetail) return null;

  return <ConceptLayout conceptDetail={conceptDetail} />;
};
