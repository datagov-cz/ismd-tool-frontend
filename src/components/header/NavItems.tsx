'use client';

import { GovButton, GovDropdown, GovIcon } from '@gov-design-system-ce/react';
import { Session } from 'next-auth';
import { useTranslations } from 'next-intl';

import { federatedSignOut } from '@/utils/federatedSignOut';
import { ConditionalTooltip } from '../shared/ConditionalTooltip';

import { NavDropdownList } from './NavDropdownList';
import { useNavigation } from './useNavigation';

interface Props {
  session: Session | null;
}

export const NavItems = ({ session }: Props) => {
  const t = useTranslations('Header');
  const { apiDocs, help, feedback, feedbackItems } = useNavigation(session);

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
      <ConditionalTooltip active message={apiDocs.label}>
        <GovButton
          color="primary"
          size="m"
          type="solid"
          className="no-underline"
          aria-label={apiDocs.label}
          href={apiDocs.href}
          target="_blank"
        >
          <GovIcon
            type="components"
            name={apiDocs.icon}
            size="xl"
            slot="icon-start"
          />
        </GovButton>
      </ConditionalTooltip>

      <ConditionalTooltip active message={help.label}>
        <GovButton
          color="primary"
          size="m"
          type="solid"
          aria-label={help.label}
          onGovClick={help.onClick}
        >
          <GovIcon
            type="components"
            name={help.icon}
            slot="icon-start"
            size="m"
          />
        </GovButton>
      </ConditionalTooltip>

      <GovDropdown id="nav-dropdown-feedback-user" position="right">
        <ConditionalTooltip active message={feedback.label}>
          <GovButton
            color="primary"
            size="m"
            type="solid"
            className="no-underline"
            aria-label={feedback.label}
          >
            <GovIcon
              type="components"
              name={feedback.icon}
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
