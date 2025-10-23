import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const SidebarContainer = ({ children }: Props) => {
  return (
    <aside className="lg:border-r lg:border-b-0 border-b border-secondary lg:pr-4 pb-6 lg:pb-0 space-y-6 w-full lg:max-w-[300px]">
      {children}
    </aside>
  );
};
