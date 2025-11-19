import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { DictionaryContent } from './dictionary-content';

interface Props {
  params: {
    slug: string;
  };
}

const DictionaryDetail = async ({ params }: Props) => {
  const { slug } = params;
  const session = await getServerSession(authOptions);

  console.log('DictDetail session: ', session);

  return <DictionaryContent userId="test" slug={slug} />;
};

export default DictionaryDetail;
