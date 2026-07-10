import { QueryClient } from '@tanstack/react-query';
import { createTranslator } from 'next-intl';
import { toast } from 'react-toastify';

import {
  getCreateConceptMutationOptions,
  getCreateOntologyMutationOptions,
  getEditConceptMutationOptions,
  getEditOntologyMutationOptions,
  getGetConceptDetailQueryKey,
  getGetOntologyDetailQueryKey,
  getGetOntologyListQueryKey,
} from '@/api/generated';
import { clearFormDraft } from '@/hooks/useFormDraft';
import { draftKeys } from '@/lib/draftKeys';
import messages from '../../messages/cs.json';

const t = createTranslator({ locale: 'cs', messages });

/**
 * Offline mutation defaults are handlers that trigger when user gets back online
 */
export const registerOfflineMutationDefaults = (queryClient: QueryClient) => {
  queryClient.setMutationDefaults(['createOntology'], {
    ...getCreateOntologyMutationOptions(),
    onSuccess: () => {
      clearFormDraft(draftKeys.ontologyCreate);
      toast(t('CreateOntology.Form.CreateNewDictSuccess'));
      return queryClient.invalidateQueries({
        queryKey: getGetOntologyListQueryKey(),
      });
    },
    onError: () => toast(t('CreateOntology.Form.CreateNewDictError')),
  });

  queryClient.setMutationDefaults(['editOntology'], {
    ...getEditOntologyMutationOptions(),
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
    onError: () => toast.error(t('DictionaryDetail.EditOntology.ErrorMessage')),
  });

  queryClient.setMutationDefaults(['createConcept'], {
    ...getCreateConceptMutationOptions(),
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
    onError: () => toast.error(t('ConceptCreateWrapper.ToastError')),
  });

  queryClient.setMutationDefaults(['editConcept'], {
    ...getEditConceptMutationOptions(),
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
    onError: () => toast.error(t('ConceptEditWrapper.ToastError')),
  });
};
