import { GovIcon, GovMessage } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { SuggestionCardSkeleton } from '@/components/dictionaryCreate/SuggestionSkeleton';

type Props = {
  isReconnecting: boolean;
};

export const AiProgress = ({ isReconnecting }: Props) => {
  const t = useTranslations('CreateOntology.AiSuggestion');

  return (
    <div className="space-y-3">
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
          <div className="font-bold">{t('Progress.Title')}</div>
          <div className="text-sm text-muted">{t('Progress.Hint')}</div>
          {isReconnecting ? (
            <div className="text-sm text-muted">
              {t('Progress.Reconnecting')}
            </div>
          ) : null}
        </GovMessage>
      </div>
      <div className="space-y-2" aria-hidden="true">
        <SuggestionCardSkeleton />
        <SuggestionCardSkeleton />
      </div>
    </div>
  );
};
