import { DictionaryContent } from './dictionary-content';

interface Props {
  params: {
    slug: string;
  };
}

const DictionaryDetail = async ({ params }: Props) => {
  const { slug } = params;
  // const session = await getServerSession(authOptions);
  // TODO: use the session to obtain userId when available
  return <DictionaryContent userId="test" slug={slug} />;
};

export default DictionaryDetail;
