import type { Metadata } from 'next';

import { DictionaryDiagramWrapper } from '@/components/dictionaryDiagram/DictionaryDiagramWrapper';

export const metadata: Metadata = { title: 'Diagram | ISMD' };

interface Props {
  params: Promise<{
    slug: string;
    id: number;
  }>;
}

const DictionaryDiagram = async ({ params }: Props) => {
  const { slug, id } = await params;
  return <DictionaryDiagramWrapper slug={slug} id={id} />;
};

export default DictionaryDiagram;
