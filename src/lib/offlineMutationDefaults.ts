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

// Toasts here fire on mutation resume, possibly after the originating form
// unmounted or after a page reload — no React context, so no useTranslations.
const t = createTranslator({ locale: 'cs', messages });

/**
 * Defaults give paused mutations a mutationFn after page reload
 * (functions are not serializable, so resumePausedMutations() relies on
 * these) and centralize success/error side effects so they also run when
 * a mutation resumes outside its originating component.
 *
 * Forms must NOT toast or invalidate in their own callbacks — only
 * navigation belongs at the component level. DictionaryEditForm must not
 * pass hook-level callbacks (they would shallow-override these defaults).
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
      toast.success(t('DictionaryDetail.EditOntology.SuccessMessage'), {
        position: 'bottom-right',
      });
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: getGetOntologyDetailQueryKey(slug),
        }),
        queryClient.invalidateQueries({
          queryKey: getGetOntologyListQueryKey(),
        }),
      ]);
    },
    onError: () =>
      toast.error(t('DictionaryDetail.EditOntology.ErrorMessage'), {
        position: 'bottom-right',
      }),
  });

  queryClient.setMutationDefaults(['createConcept'], {
    ...getCreateConceptMutationOptions(),
    onSuccess: (response, variables) => {
      clearFormDraft(draftKeys.conceptCreate(variables.slug));
      toast.success(t('ConceptCreateWrapper.ToastSuccess'), {
        position: 'bottom-right',
      });
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
    onError: () =>
      toast.error(t('ConceptCreateWrapper.ToastError'), {
        position: 'bottom-right',
      }),
  });

  queryClient.setMutationDefaults(['editConcept'], {
    ...getEditConceptMutationOptions(),
    onSuccess: (response) => {
      const slug = response.data?.slug ?? '';
      clearFormDraft(draftKeys.conceptEdit(slug));
      toast.success(t('ConceptEditWrapper.ToastSuccess'), {
        position: 'bottom-right',
      });
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
    onError: () =>
      toast.error(t('ConceptEditWrapper.ToastError'), {
        position: 'bottom-right',
      }),
  });
};
