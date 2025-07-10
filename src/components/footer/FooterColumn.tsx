import { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

export const FooterColumn = ({ title, children }: Props) => {
  return (
    <li className="space-y-4">
      <h5 className="font-medium text-xl">{title}</h5>
      {children}
    </li>
  );
};
