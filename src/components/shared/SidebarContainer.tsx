import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const SidebarContainer = ({ children }: Props) => {
  return (
    <aside className="lg:border-r border-secondary pr-4 space-y-6 max-w-[300px]">
      {children}
    </aside>
  );
};
