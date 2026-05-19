import { ConceptCreateWrapper } from '@/components/conceptForm/ConceptCreate';

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
