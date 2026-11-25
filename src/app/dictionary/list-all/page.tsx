import type { Metadata } from 'next';

import { FullListWrapper } from '@/components/ontologyList/FullListWrapper';

export const metadata: Metadata = { title: 'Všechny slovníky | ISMD' };

const FullList = async () => {
  return (
    <div className="w-full bg-surface-page">
      <FullListWrapper />
    </div>
  );
};

export default FullList;
