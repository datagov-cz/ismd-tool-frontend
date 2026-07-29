'use client';

import { GovButton, GovDropdown, GovIcon } from '@gov-design-system-ce/react';
import { Session } from 'next-auth';
import { useTranslations } from 'next-intl';

import { useHintboxStore } from '@/store/hintboxStore';
import { federatedSignOut } from '@/utils/federatedSignOut';
import { ConditionalTooltip } from '../shared/ConditionalTooltip';

import { GITHUB_BASE } from './constants';
import { NavDropdownItem, NavDropdownList } from './NavDropdownList';

interface Props {
  session: Session | null;
}

export const NavItems = ({ session }: Props) => {
  const t = useTranslations('Header');
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
        <GovDropdown id="nav-dropdown-user" position="left">
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
                onClick: () => void federatedSignOut(),
              },
            ]}
          />
        </GovDropdown>
      )}
      <ConditionalTooltip active message={'Dokumentace API'}>
        <GovButton
          color="primary"
          size="m"
          type="solid"
          className="no-underline"
          aria-label={'Dokumentace API'}
          href={`${process.env.NEXT_PUBLIC_BASE_PATH}/swagger-ui/index.html`}
          target="_blank"
        >
          <GovIcon type="components" name="book" size="xl" slot="icon-start" />
        </GovButton>
      </ConditionalTooltip>

      <ConditionalTooltip active message={t(`${prefix}.Link1`)}>
        <GovButton
          color="primary"
          size="m"
          type="solid"
          aria-label={t(`${prefix}.Link1`)}
          onGovClick={() => setIsHintboxOpen(true)}
        >
          <GovIcon
            type="components"
            name="question-square"
            slot="icon-start"
            size="m"
          />
        </GovButton>
      </ConditionalTooltip>

      <GovDropdown id="nav-dropdown-feedback-user" position="right">
        <ConditionalTooltip active message={t('Nav.Dropdown.Label')}>
          <GovButton
            color="primary"
            size="m"
            type="solid"
            className="no-underline"
            aria-label={t('Nav.Dropdown.Label')}
          >
            <GovIcon
              type="components"
              name="chat-dots"
              size="m"
              slot="icon-start"
            />
          </GovButton>
        </ConditionalTooltip>
        <NavDropdownList items={feedbackItems} />
      </GovDropdown>
    </>
  );
};
