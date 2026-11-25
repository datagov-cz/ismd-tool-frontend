import type { Metadata } from 'next';

import { DictionaryEditWrapper } from '@/components/dictionaryEdit/DictionaryEditWrapper';

export const metadata: Metadata = { title: 'Úprava slovníku | ISMD' };

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

const DictionaryEdit = async ({ params }: Props) => {
  const { slug } = await params;
  return <DictionaryEditWrapper slug={slug} />;
};

export default DictionaryEdit;
