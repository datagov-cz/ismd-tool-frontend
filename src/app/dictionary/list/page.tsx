import type { Metadata } from 'next';

import { ISMDListWrapper } from '@/components/ontologyList/ISMDlistWrapper';

export const metadata: Metadata = { title: 'Slovníky ISMD | ISMD' };

const ISMDList = async () => {
  return (
    <div className="w-full bg-surface-page">
      <ISMDListWrapper />
    </div>
  );
};

export default ISMDList;
