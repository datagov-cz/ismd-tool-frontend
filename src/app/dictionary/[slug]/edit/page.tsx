import { DictionaryEditWrapper } from '@/components/dictionaryEdit/DictionaryEditWrapper';

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
