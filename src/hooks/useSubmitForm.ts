import { onlineManager } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { clearFormDraft } from '@/hooks/useFormDraft';

type SubmitFormOptions<TVariables, TResponse> = {
  mutate: (
    _variables: TVariables,
    _options: { onSuccess?: (_response: TResponse) => void },
  ) => void;
  variables: TVariables;
  onSuccess: (_response: TResponse) => void;
  draftKey?: string;
  reset?: () => void;
  offlineMessage?: string;
};

/**
 * Generic hook that handles for submission when online
 * and mutation queuing when offline
 */
export const useSubmitForm = () => {
  const t = useTranslations('Offline');

  return <TVariables, TResponse>({
    mutate,
    variables,
    onSuccess,
    draftKey,
    reset,
    offlineMessage,
  }: SubmitFormOptions<TVariables, TResponse>) => {
    const wasOffline = !onlineManager.isOnline();

    mutate(variables, { onSuccess: wasOffline ? undefined : onSuccess });

    if (wasOffline) {
      reset?.();
      clearFormDraft(draftKey);
      toast(offlineMessage ?? t('SavedOffline'));
    }
  };
};
