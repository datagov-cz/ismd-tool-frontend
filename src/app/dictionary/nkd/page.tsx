import type { Metadata } from 'next';

import { DictionaryContentNKD } from './dictionary-content';

export const metadata: Metadata = { title: 'Slovník NKD | ISMD' };

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
