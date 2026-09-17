import { DictionaryDiagramWrapper } from '@/components/dictionaryDiagram/DictionaryDiagramWrapper';

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
