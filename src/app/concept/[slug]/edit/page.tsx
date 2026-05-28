import { ConceptEditWrapper } from '@/components/conceptForm/ConceptEdit';

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
