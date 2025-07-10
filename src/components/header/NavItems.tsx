import { useState } from 'react';
import { GovButton, GovDropdown, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { NavItem } from './NavItem';

export const NavItems = () => {
  const t = useTranslations('Header');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <NavItem href="">{t('Nav.Link1')}</NavItem>
      <NavItem href="">{t('Nav.Link2')}</NavItem>
      <GovDropdown
        position="left"
        onGovChange={(e) => setIsDropdownOpen(e.detail.open)}
      >
        <GovButton
          color="primary"
          size="m"
          type="base"
          className="no-underline"
        >
          {t('Nav.Dropdown.Label')}
          <GovIcon
            type="components"
            name="chevron-down"
            slot="icon-end"
            className={`transition-transform duration-200 ${isDropdownOpen ? '-rotate-180' : ''}`}
          />
        </GovButton>

        <ul slot="list">
          <li>
            <GovButton
              color="neutral"
              size="m"
              type="base"
              href="https://github.com/datagov-cz/ismd-org/issues/new?template=bug_report.yml"
              target="_blank"
              expanded
            >
              {t('Nav.Dropdown.Link1')}
              <GovIcon
                type="components"
                name="bug"
                slot="icon-start"
                size="l"
                className="[&>svg>path]:fill-black dark:[&>svg>path]:fill-white"
              />
            </GovButton>
          </li>
          <li>
            <GovButton
              color="neutral"
              size="m"
              type="base"
              href="https://github.com/datagov-cz/ismd-org/issues/new?template=feature_request.yml"
              target="_blank"
              expanded
            >
              {t('Nav.Dropdown.Link2')}
              <GovIcon
                type="components"
                name="flag"
                slot="icon-start"
                size="l"
                className="[&>svg>path]:fill-black dark:[&>svg>path]:fill-white"
              />
            </GovButton>
          </li>
        </ul>
      </GovDropdown>
    </>
  );
};
