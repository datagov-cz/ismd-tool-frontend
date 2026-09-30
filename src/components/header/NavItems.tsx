'use client';

import { GovButton, GovDropdown, GovIcon } from '@gov-design-system-ce/react';
import { Session } from 'next-auth';
import { useTranslations } from 'next-intl';

import { federatedSignOut } from '@/utils/federatedSignOut';
import { ConditionalTooltip } from '../shared/ConditionalTooltip';

import { navDropdownItems } from './NavDropdownList';
import { useHeaderButtonType } from './useHeaderButtonType';
import { useNavigation } from './useNavigation';

interface Props {
  session: Session | null;
}

export const NavItems = ({ session }: Props) => {
  const t = useTranslations('Header');
  const { apiDocs, help, feedback, feedbackItems } = useNavigation(session);
  const buttonType = useHeaderButtonType();

  return (
    <>
      {session && (
        <GovDropdown
          id="nav-dropdown-user"
          position="left"
          color="primary"
          size="m"
          type={buttonType}
          label={
            <>
              <GovIcon type="components" name="person" size="xl" />
              {session.user?.name}
            </>
          }
        >
          {navDropdownItems([
            {
              icon: 'upload',
              label: t('NavLogged.Logout'),
              onClick: () => void federatedSignOut(),
            },
          ])}
        </GovDropdown>
      )}
      <ConditionalTooltip active message={apiDocs.label}>
        <GovButton
          color="primary"
          size="m"
          type={buttonType}
          className="no-underline"
          aria-label={apiDocs.label}
          href={apiDocs.href}
          target="_blank"
          iconStart={
            <GovIcon type="components" name={apiDocs.icon} size="xl" />
          }
        ></GovButton>
      </ConditionalTooltip>

      <ConditionalTooltip active message={help.label}>
        <GovButton
          color="primary"
          size="m"
          type={buttonType}
          aria-label={help.label}
          onClick={help.onClick}
          iconStart={<GovIcon type="components" name={help.icon} size="m" />}
        ></GovButton>
      </ConditionalTooltip>

      <ConditionalTooltip active message={feedback.label}>
        <span className="inline-flex">
          <GovDropdown
            id="nav-dropdown-feedback-user"
            position="right"
            color="primary"
            size="m"
            type={buttonType}
            aria-label={feedback.label}
            label={<GovIcon type="components" name={feedback.icon} size="m" />}
          >
            {navDropdownItems(feedbackItems)}
          </GovDropdown>
        </span>
      </ConditionalTooltip>
    </>
  );
};
