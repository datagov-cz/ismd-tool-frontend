import { DictionaryDiagramWrapper } from '@/components/dictionaryDiagram/DictionaryDiagramWrapper';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

const DictionaryDiagram = async ({ params }: Props) => {
  const { slug } = await params;
  return <DictionaryDiagramWrapper slug={slug} />;
};

export default DictionaryDiagram;
