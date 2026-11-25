import type { Metadata } from 'next';

import { ConceptContentNKD } from './concept-content';

export const metadata: Metadata = { title: 'Pojem NKD | ISMD' };

interface Props {
  searchParams: Promise<{
    iri: string;
  }>;
}

const ConceptDetail = async ({ searchParams }: Props) => {
  const { iri } = await searchParams;
  return <ConceptContentNKD slug={iri} />;
};

export default ConceptDetail;
