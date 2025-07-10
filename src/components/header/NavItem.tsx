import { ReactNode } from 'react';
import { GovButton } from '@gov-design-system-ce/react';

interface Props {
  href: string;
  children: ReactNode;
}

export const NavItem = ({ href, children }: Props) => {
  return (
    <li>
      <GovButton color="primary" size="m" type="base" href={href}>
        {children}
      </GovButton>
    </li>
  );
};
