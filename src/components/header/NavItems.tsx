import { useState } from 'react';
import { GovButton, GovDropdown, GovIcon } from '@gov-design-system-ce/react';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { useHintboxStore } from '@/store/hintboxStore';
import { Button } from '../shared/Button';
import { ButtonLink } from '../shared/ButtonLink';

import { NavItem } from './NavItem';
import { OnlineIndicator } from './OnlineIndicator';

interface Props {
  session: Session | null;
}

export const NavItems = ({ session }: Props) => {
  const t = useTranslations('Header');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const setIsHintboxOpen = useHintboxStore((state) => state.setIsOpen);

  if (!session) {
    return (
      <>
        <GovButton
          color="primary"
          size="m"
          type="base"
          onGovClick={() => setIsHintboxOpen(true)}
        >
          {t('Nav.Link1')}
        </GovButton>
        <GovDropdown
          id="nav-dropdown-guest"
          position="left"
          onChange={() => setIsDropdownOpen(!isDropdownOpen)}
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
              <ButtonLink
                href="https://github.com/datagov-cz/ismd-org/issues/new?template=bug_report.yml"
                target="_blank"
                className="border-none justify-start"
              >
                <GovIcon
                  type="components"
                  name="bug"
                  slot="icon-start"
                  size="l"
                  className="[&>svg>path]:fill-black dark:[&>svg>path]:fill-white"
                />
                {t('Nav.Dropdown.Link1')}
              </ButtonLink>
            </li>
            <li>
              <ButtonLink
                href="https://github.com/datagov-cz/ismd-org/issues/new?template=feature_request.yml"
                target="_blank"
                className="border-none justify-start"
              >
                <GovIcon
                  type="components"
                  name="flag"
                  slot="icon-start"
                  size="l"
                  className="[&>svg>path]:fill-black dark:[&>svg>path]:fill-white"
                />
                {t('Nav.Dropdown.Link2')}
              </ButtonLink>
            </li>
          </ul>
        </GovDropdown>
      </>
    );
  }

  return (
    <>
      <OnlineIndicator />
      <NavItem href="">{t('NavLogged.Link1')}</NavItem>
      <GovButton
        color="primary"
        size="m"
        type="base"
        onGovClick={() => setIsHintboxOpen(true)}
      >
        {t('NavLogged.Link2')}
      </GovButton>
      <GovDropdown
        id="nav-dropdown-user"
        position="left"
        onChange={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <GovButton
          color="primary"
          size="m"
          type="base"
          className="no-underline"
        >
          {t('NavLogged.Dropdown.Label')}
          <GovIcon
            type="components"
            name="chevron-down"
            slot="icon-end"
            className={`transition-transform duration-200 ${isDropdownOpen ? '-rotate-180' : ''}`}
          />
        </GovButton>

        <ul slot="list">
          <li>
            <ButtonLink
              href="https://github.com/datagov-cz/ismd-org/issues/new?template=bug_report.yml"
              target="_blank"
              className="border-none justify-start"
            >
              {t('NavLogged.Dropdown.Link1')}
              <GovIcon
                type="components"
                name="bug"
                slot="icon-start"
                size="l"
                className="[&>svg>path]:fill-black dark:[&>svg>path]:fill-white"
              />
            </ButtonLink>
          </li>
          <li>
            <ButtonLink
              href="https://github.com/datagov-cz/ismd-org/issues/new?template=feature_request.yml"
              target="_blank"
              className="border-none justify-start"
            >
              {t('NavLogged.Dropdown.Link2')}
              <GovIcon
                type="components"
                name="flag"
                slot="icon-start"
                size="l"
                className="[&>svg>path]:fill-black dark:[&>svg>path]:fill-white"
              />
            </ButtonLink>
          </li>
        </ul>
      </GovDropdown>
      <Button onClick={() => signOut()}>{t('NavLogged.Logout')}</Button>
    </>
  );
};
