import type { Metadata } from 'next';

import { DatasetsListWrapper } from '@/components/dataSets/DatasetsListWrapper';

export const metadata: Metadata = { title: 'Datové sady | ISMD' };

const DatasetsList = async () => {
  return (
    <div className="w-full bg-primary-subtlest px-5">
      <DatasetsListWrapper />
    </div>
  );
};

export default DatasetsList;
