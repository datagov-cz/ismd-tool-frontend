import type { Metadata } from 'next';

import { ConceptCreateWrapper } from '@/components/conceptForm/ConceptCreate';

export const metadata: Metadata = { title: 'Nový pojem | ISMD' };

interface Props {
  searchParams: Promise<{
    ontology: string;
  }>;
}

const CreateConcept = async ({ searchParams }: Props) => {
  const { ontology } = await searchParams;
  return <ConceptCreateWrapper ontology={ontology} />;
};

export default CreateConcept;
