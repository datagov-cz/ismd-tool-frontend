import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const GridContainer = ({ children }: Props) => {
  return <div className="grid grid-cols-5 gap-x-4 gap-y-2">{children}</div>;
};
