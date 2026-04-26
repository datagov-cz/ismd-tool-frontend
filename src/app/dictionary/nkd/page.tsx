import { DictionaryContentNKD } from './dictionary-content';

interface Props {
  searchParams: Promise<{
    iri: string;
  }>;
}

const DictionaryDetail = async ({ searchParams }: Props) => {
  const { iri } = await searchParams;

  return <DictionaryContentNKD slug={decodeURIComponent(iri)} />;
};

export default DictionaryDetail;
