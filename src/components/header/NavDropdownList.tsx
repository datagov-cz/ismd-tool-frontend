import { GovButton, GovIcon } from '@gov-design-system-ce/react';

export interface NavDropdownItem {
  href?: string;
  label: string;
  icon: string;
  onClick?: () => void;
}

export const NavDropdownList = ({ items }: { items: NavDropdownItem[] }) => (
  <ul slot="list" className="p-0!">
    {items.map(({ href, icon, label, onClick }) => (
      <li key={label}>
        <GovButton
          href={href}
          target={href ? '_blank' : undefined}
          expanded={true}
          type="base"
          color="neutral"
          onGovClick={onClick}
        >
          <GovIcon type="components" name={icon} slot="icon-start" size="l" />
          {label}
        </GovButton>
      </li>
    ))}
  </ul>
);
