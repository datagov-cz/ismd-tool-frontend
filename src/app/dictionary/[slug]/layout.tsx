import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const DictionaryDetailLayout = ({ children }: Props) => {
  return (
    <div className="w-full max-w-desktop mx-auto px-3 xl:px-0 py-6 flex gap-x-4 gap-y-8 flex-col lg:flex-row">
      {children}
    </div>
  );
};

export default DictionaryDetailLayout;
