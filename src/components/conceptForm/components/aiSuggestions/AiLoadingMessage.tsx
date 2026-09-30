import { GovIcon, GovMessage } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

type Props = {
  isReconnecting?: boolean;
};

export const AiLoadingMessage = ({ isReconnecting = false }: Props) => {
  const t = useTranslations('CreateConcept.LegalSourceAutofill.Ai');

  return (
    <div aria-live="polite">
      <GovMessage
        color="primary"
        type="subtle"
        icon={
          <GovIcon
            type="components"
            name="loader"
            size="s"
            className="animate-spin motion-reduce:animate-none"
          />
        }
      >
        <div className="font-bold">{t('LoadingTitle')}</div>
        <div className="text-sm text-muted">{t('LoadingHint')}</div>
        {isReconnecting ? (
          <div className="text-sm text-muted">{t('Reconnecting')}</div>
        ) : null}
      </GovMessage>
    </div>
  );
};
