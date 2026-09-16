import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { IdpAlias } from '@/hooks/useLogin';

export const LoginButton = ({
  size,
  className,
  idp = 'caais',
  short = false,
  onLogin,
}: {
  size: 's' | 'l' | 'm';
  className?: string;
  /** Identity provider this button logs in through. */
  idp?: IdpAlias;
  /** Bare provider name ("CAAIS") for the header bar, rather than the full sentence. */
  short?: boolean;
  onLogin: (_idp: IdpAlias) => void;
}) => {
  const t = useTranslations('Header');
  const labelKey = short ? 'LoginButtonShort' : 'LoginButton';

  return (
    <GovButton
      type="solid"
      color="secondary"
      size={size}
      className={className}
      onGovClick={() => onLogin(idp)}
    >
      <GovIcon
        type="components"
        name="box-arrow-in-left"
        slot="icon-end"
        size={size}
      />
      {t(`${labelKey}.${idp}`)}
    </GovButton>
  );
};
