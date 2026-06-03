import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

export const LoginButton = ({
  size,
  className,
  onLogin,
}: {
  size: 's' | 'l' | 'm';
  className?: string;
  onLogin: () => void;
}) => {
  const t = useTranslations('Header');
  return (
    <GovButton
      type="solid"
      color="secondary"
      size={size}
      className={className}
      onGovClick={onLogin}
    >
      <GovIcon
        type="components"
        name="box-arrow-in-left"
        slot="icon-end"
        size={size}
      />
      {t('LoginButton')}
    </GovButton>
  );
};
