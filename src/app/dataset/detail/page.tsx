import { DatasetDetailWrapper } from '@/components/dataSets/DatasetDetail';

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
