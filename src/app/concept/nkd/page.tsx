import { ConceptContentNKD } from './concept-content';

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
