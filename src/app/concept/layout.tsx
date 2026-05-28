'use client';

import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const DictionaryDetailLayout = ({ children }: Props) => {
  return <div className="w-full flex-1">{children}</div>;
};

export default DictionaryDetailLayout;
