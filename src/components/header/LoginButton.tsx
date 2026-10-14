import {
  GovButton,
  GovControlGroup,
  GovDropdown,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { useLogin } from '@/hooks/useLogin';

export const LoginButton = ({
  size,
  className,
  short = false,
  niaEnabled,
}: {
  size: 's' | 'l' | 'm';
  className?: string;
  short?: boolean;
  niaEnabled: boolean;
}) => {
  const t = useTranslations('Header');
  const labelKey = short ? 'LoginButtonShort' : 'LoginButton';

  const login = useLogin();

  return (
    <GovControlGroup>
      <GovButton
        type="solid"
        color="secondary"
        size={size}
        className={className}
        onClick={() => login('caais')}
        iconEnd={
          <GovIcon type="components" name="box-arrow-in-left" size={size} />
        }
      >
        {t(`${labelKey}.caais`)}
      </GovButton>
      <GovDropdown
        type="solid"
        size={size}
        color="secondary"
        position="right"
        iconStart={<GovIcon name="chevron-down" />}
      >
        {niaEnabled && (
          <GovButton
            size={size}
            color="neutral"
            type="base"
            expanded
            className={className}
            onClick={() => login('nia')}
          >
            {t(`${labelKey}.nia`)}
          </GovButton>
        )}
        <GovButton
          size={size}
          color="neutral"
          type="base"
          className={className}
          expanded
          onClick={() => login()}
        >
          {t(`${labelKey}.keycloak`)}
        </GovButton>
      </GovDropdown>
    </GovControlGroup>
  );
};
