import { GovButton, GovIcon, GovMessage } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

type Props = {
  message: string;
  color?: 'primary' | 'warning' | 'error';
  onRetry?: () => void;
};

export const AiStatusMessage = ({
  message,
  color = 'primary',
  onRetry,
}: Props) => {
  const t = useTranslations('CreateConcept.LegalSourceAutofill.Ai');

  return (
    <GovMessage
      color={color}
      type="subtle"
      icon={
        <GovIcon
          type="components"
          name={color === 'primary' ? 'info-circle' : 'exclamation-triangle'}
        />
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>{message}</span>
        {onRetry ? (
          <GovButton
            type="outlined"
            color="primary"
            size="s"
            nativeType="button"
            onClick={onRetry}
          >
            {t('Retry')}
          </GovButton>
        ) : null}
      </div>
    </GovMessage>
  );
};
