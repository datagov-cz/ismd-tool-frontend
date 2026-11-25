import type { Metadata } from 'next';

import { DictionaryContent } from './dictionary-content';

export const metadata: Metadata = { title: 'Slovník | ISMD' };

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
