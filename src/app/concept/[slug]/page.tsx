import ConceptContent from './concept-content';

interface Props {
  params: {
    slug: string;
  };
}

const ConceptDetail = ({ params }: Props) => {
  return <ConceptContent slug={params.slug} />;
};

export default ConceptDetail;
