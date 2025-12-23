import ConceptContent from './concept-content';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

const ConceptDetail = async ({ params }: Props) => {
  const { slug } = await params;
  return <ConceptContent slug={slug} />;
};

export default ConceptDetail;
