import type { Metadata } from 'next';

import { ConceptContent } from './concept-content';

export const metadata: Metadata = { title: 'Pojem | ISMD' };

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
