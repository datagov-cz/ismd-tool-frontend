import { QueryClient, UseMutationOptions } from '@tanstack/react-query';
import { createTranslator } from 'next-intl';
import { toast } from 'react-toastify';

import {
  getGetConceptDetailQueryKey,
  getGetOntologyDetailQueryKey,
  getGetOntologyListQueryKey,
} from '@/api/generated';
import { clearFormDraft } from '@/hooks/useFormDraft';
import { draftKeys } from '@/lib/draftKeys';
import {
  OfflineMutationKey,
  OfflineMutationResponse,
  offlineMutations,
  OfflineMutationVariables,
} from '@/lib/offlineMutations';
import { getErrorMessage } from '@/utils/getErrorMessage';
import messages from '../../messages/cs.json';

const t = createTranslator({ locale: 'cs', messages });
const tError = createTranslator({
  locale: 'cs',
  messages,
  namespace: 'Errors',
});
const translateError: (_key: string) => string = () => tError('UnknownError');

type SideEffects<K extends OfflineMutationKey> = {
  onSuccess: (
    _response: OfflineMutationResponse<K>,
    _variables: OfflineMutationVariables<K>,
  ) => unknown;
  onError: (_error: unknown) => void;
};

/**
 * Offline mutation defaults are handlers that trigger when user gets back online
 */
export const registerOfflineMutationDefaults = (queryClient: QueryClient) => {
  const sideEffects: { [K in OfflineMutationKey]: SideEffects<K> } = {
    createOntology: {
      onSuccess: () => {
        clearFormDraft(draftKeys.ontologyCreate);
        toast(t('CreateOntology.Form.CreateNewDictSuccess'));
        return queryClient.invalidateQueries({
          queryKey: getGetOntologyListQueryKey(),
        });
      },
      onError: (error) => toast.error(getErrorMessage(error, translateError)),
    },
    editOntology: {
      onSuccess: (response) => {
        const slug = response.data?.slug ?? '';
        clearFormDraft(draftKeys.ontologyEdit(slug));
        toast.success(t('DictionaryDetail.EditOntology.SuccessMessage'));

        return Promise.all([
          queryClient.invalidateQueries({
            queryKey: getGetOntologyDetailQueryKey(slug),
          }),
          queryClient.invalidateQueries({
            queryKey: getGetOntologyListQueryKey(),
          }),
        ]);
      },
      onError: (error) => toast.error(getErrorMessage(error, translateError)),
    },
    createConcept: {
      onSuccess: (response, variables) => {
        clearFormDraft(draftKeys.conceptCreate(variables.slug));
        toast.success(t('ConceptCreateWrapper.ToastSuccess'));

        return Promise.all([
          queryClient.invalidateQueries({
            queryKey: getGetOntologyDetailQueryKey(variables.slug),
          }),
          queryClient.invalidateQueries({
            queryKey: getGetConceptDetailQueryKey(
              encodeURIComponent(response.data?.slug ?? ''),
            ),
          }),
        ]);
      },
      onError: (error) => toast.error(getErrorMessage(error, translateError)),
    },
    editConcept: {
      onSuccess: (response) => {
        const slug = response.data?.slug ?? '';
        clearFormDraft(draftKeys.conceptEdit(slug));
        toast.success(t('ConceptEditWrapper.ToastSuccess'));

        return Promise.all([
          queryClient.invalidateQueries({
            queryKey: getGetConceptDetailQueryKey(encodeURIComponent(slug)),
          }),
          queryClient.invalidateQueries({
            queryKey: getGetOntologyDetailQueryKey(
              response.data?.ontologySlug ?? '',
            ),
          }),
        ]);
      },
      onError: (error) => toast.error(getErrorMessage(error, translateError)),
    },
  };

  (Object.keys(offlineMutations) as OfflineMutationKey[]).forEach((key) => {
    const getOptions = offlineMutations[key] as () => UseMutationOptions<
      unknown,
      unknown,
      unknown
    >;
    const effects = sideEffects[key] as {
      onSuccess: (_response: unknown, _variables: unknown) => unknown;
      onError: (_error: unknown) => void;
    };
    const options = getOptions();
    queryClient.setMutationDefaults(options.mutationKey ?? [key], {
      ...options,
      ...effects,
      networkMode: 'online',
    });
  });
};
