import { onlineManager } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { clearFormDraft } from '@/hooks/useFormDraft';
import type {
  OfflineMutationKey,
  OfflineMutationResponse,
  OfflineMutationVariables,
} from '@/lib/offlineMutations';

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

type RegisteredMutation = {
  [K in OfflineMutationKey]: [
    OfflineMutationVariables<K>,
    OfflineMutationResponse<K>,
  ];
}[OfflineMutationKey];

/**
 * Generic hook that handles form submission when online
 * and mutation queuing when offline. Accepts only mutations
 * registered in registerOfflineMutationDefaults, which supplies
 * their offline resume and success/error side effects.
 */
export const useSubmitForm = () => {
  const t = useTranslations('Offline');

  return <TVariables, TResponse>(
    options: SubmitFormOptions<TVariables, TResponse> &
      ([TVariables, TResponse] extends RegisteredMutation
        ? unknown
        : { mutate: never }),
  ) => {
    const { mutate, variables, onSuccess, draftKey, reset, offlineMessage } =
      options as SubmitFormOptions<TVariables, TResponse>;

    const wasOffline = !onlineManager.isOnline();

    mutate(variables, { onSuccess: wasOffline ? undefined : onSuccess });

    if (wasOffline) {
      reset?.();
      clearFormDraft(draftKey);
      toast.info(offlineMessage ?? t('SavedOffline'), { autoClose: 10000 });
    }
  };
};
