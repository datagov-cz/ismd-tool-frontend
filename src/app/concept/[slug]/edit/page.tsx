import type { Metadata } from 'next';

import { ConceptEditWrapper } from '@/components/conceptForm/ConceptEdit';

export const metadata: Metadata = { title: 'Úprava pojmu | ISMD' };

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

const EditConcept = async ({ params }: Props) => {
  const { slug } = await params;
  return <ConceptEditWrapper slug={slug} />;
};

export default EditConcept;
