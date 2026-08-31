import { ReactNode } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';

export interface NavDropdownItem {
  href?: string;
  label: string;
  icon: string;
  onClick?: () => void;
}

export const navDropdownItems = (items: NavDropdownItem[]): ReactNode[] =>
  items.map(({ href, icon, label, onClick }) => (
    <GovButton
      key={label}
      href={href}
      target={href ? '_blank' : undefined}
      expanded={true}
      type="base"
      color="neutral"
      onClick={onClick}
      iconStart={<GovIcon type="components" name={icon} size="l" />}
    >
      {label}
    </GovButton>
  ));
