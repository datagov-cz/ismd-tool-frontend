import type { Metadata } from 'next';

import { DatasetDetailWrapper } from '@/components/dataSets/DatasetDetail';

export const metadata: Metadata = { title: 'Datová sada | ISMD' };

interface Props {
  searchParams: Promise<{
    iri: string;
  }>;
}

const DatasetDetail = async ({ searchParams }: Props) => {
  const { iri } = await searchParams;

  return <DatasetDetailWrapper iri={decodeURIComponent(iri)} />;
};

export default DatasetDetail;
