'use client';

import { useState } from 'react';
import { GovButton, GovDropdown, GovIcon } from '@gov-design-system-ce/react';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { useHintboxStore } from '@/store/hintboxStore';
import { ConditionalTooltip } from '../shared/ConditionalTooltip';

import { NavDropdownItem, NavDropdownList } from './NavDropdownList';

const GITHUB_BASE = 'https://github.com/datagov-cz/ismd-org/issues/new';

interface Props {
  session: Session | null;
}

export const NavItems = ({ session }: Props) => {
  const t = useTranslations('Header');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isFeedbackDropdownOpen, setIsFeedbackDropdownOpen] = useState(false);
  const setIsHintboxOpen = useHintboxStore((state) => state.setIsOpen);

  const prefix = session ? 'NavLogged' : 'Nav';
  const feedbackItems: NavDropdownItem[] = [
    {
      href: `${GITHUB_BASE}?template=bug_report.yml`,
      icon: 'bug',
      label: t(`${prefix}.Dropdown.Link1`),
    },
    {
      href: `${GITHUB_BASE}?template=feature_request.yml`,
      icon: 'flag',
      label: t(`${prefix}.Dropdown.Link2`),
    },
  ];

  return (
    <>
      {session && (
        <GovDropdown
          id="nav-dropdown-user"
          position="left"
          onChange={() => setIsUserDropdownOpen((prev) => !prev)}
        >
          <GovButton
            color="primary"
            size="m"
            type="solid"
            className="no-underline"
          >
            <GovIcon
              type="components"
              name="person"
              size="xl"
              slot="icon-start"
              className={`transition-transform duration-200 ${isUserDropdownOpen ? '-rotate-180' : ''}`}
            />
            {session.user?.name}
          </GovButton>
          <NavDropdownList
            items={[
              {
                icon: 'gear',
                label: t('NavLogged.Settings'),
                onClick: () => {},
              },
              {
                icon: 'upload',
                label: t('NavLogged.Logout'),
                onClick: () =>
                  signOut({ callbackUrl: process.env.NEXT_PUBLIC_BASE_PATH }),
              },
            ]}
          />
        </GovDropdown>
      )}

      <GovButton
        color="primary"
        size="m"
        type="solid"
        className="no-underline"
        href={`${process.env.NEXT_PUBLIC_BASE_PATH}/swagger-ui/index.html`}
        target="_blank"
      >
        <GovIcon type="components" name="book" size="xl" slot="icon-start" />
        {!session && 'Dokumentace API'}
      </GovButton>

      <ConditionalTooltip
        active={!!session}
        message={t(`${prefix}.Link1`)}
        key={t(`${prefix}.Link1`)}
      >
        <GovButton
          color="primary"
          size="m"
          type="solid"
          onGovClick={() => setIsHintboxOpen(true)}
        >
          <GovIcon
            type="components"
            name="question-square"
            slot="icon-start"
            size="m"
          />
          {!session && t('Nav.Link1')}
        </GovButton>
      </ConditionalTooltip>

      <GovDropdown
        id="nav-dropdown-feedback-user"
        position="left"
        onChange={() => setIsFeedbackDropdownOpen((prev) => !prev)}
      >
        <ConditionalTooltip
          active={!!session}
          message={t('Nav.Dropdown.Label')}
        >
          <GovButton
            color="primary"
            size="m"
            type="solid"
            className="no-underline"
          >
            <GovIcon
              type="components"
              name="chat-dots"
              size="m"
              slot="icon-start"
              className={`transition-transform duration-200 ${isFeedbackDropdownOpen ? '-rotate-180' : ''}`}
            />
            {!session && t('Nav.Dropdown.Label')}
          </GovButton>
        </ConditionalTooltip>
        <NavDropdownList items={feedbackItems} />
      </GovDropdown>
    </>
  );
};
