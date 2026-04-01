import { DictionaryContent } from './dictionary-content';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

const DictionaryDetail = async ({ params }: Props) => {
  const { slug } = await params;
  return <DictionaryContent slug={slug} />;
};

export default DictionaryDetail;
