import type { Metadata } from 'next';

import { NKDListWrapper } from '@/components/ontologyList/NKDlistWrapper';

export const metadata: Metadata = { title: 'Slovníky NKD | ISMD' };

const NKDList = async () => {
  return (
    <div className="w-full bg-surface-page px-5">
      <NKDListWrapper />
    </div>
  );
};

export default NKDList;
