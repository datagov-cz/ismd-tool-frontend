import { useEffect, useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  OntologyMetadataModel,
  UploadFromFileBody,
  useUploadFromFile,
} from '@/api/generated';
import { FormSection } from '@/components/conceptForm/components/FormSection';
import { CircularLoader } from '@/components/shared/CircularLoader';
import { ErrorText } from '@/components/shared/ErrorText';
import { OfnIssuesList } from '@/components/shared/OfnIssuesList';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';
import { db, type UploadFromFileDraft } from '@/lib/db';
import { uploadOntologySchema } from '@/lib/formSchemas';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
  getOfnConformanceError,
  isOfnUploadNonconformant,
  OfnIssuesData,
} from '@/utils/ofnConformance';

import { FileController } from './FileController';
import {
  getMissingInSchemeError,
  InSchemeDecisionData,
} from './inSchemeDecision';

interface UploadDialogProps {
  setSuccess: (_value: OntologyMetadataModel) => void;
  setDecisionRequired: (_value: InSchemeDecisionData) => void;
}

export const UploadDialog = ({
  setSuccess,
  setDecisionRequired,
}: UploadDialogProps) => {
  const [submitError, setSubmitError] = useState<string>();
  const [ofnIssues, setOfnIssues] = useState<OfnIssuesData>();

  const isOnline = useIsOnline();

  const invalidator = useQueryInvalidator();

  const t = useTranslations('UploadOntology');
  const tError = useTranslations('Errors');

  const mutation = useUploadFromFile({
    mutation: {
      onSuccess: (data) => {
        if (data.data) {
          setSubmitError(undefined);
          setSuccess(data.data);
          invalidator.invalidateOntologyList();
        }
      },
      onError: (error) => {
        // The decision case is handled per-call in onSubmit — don't show it as an error.
        if (getMissingInSchemeError(error)) return;
        if (isOfnUploadNonconformant(error)) {
          setSubmitError(undefined);
          void getOfnConformanceError(error).then((result) =>
            setOfnIssues(result?.data),
          );
          return;
        }
        setOfnIssues(undefined);
        setSubmitError(getErrorMessage(error, tError));
      },
    },
  });

  const form = useForm<UploadFromFileBody>({
    resolver: zodResolver(uploadOntologySchema()),
  });

  const { handleSubmit } = form;

  const syncOfflineData = async () => {
    try {
      const drafts = await db.uploadFileDrafts.toArray();
      for (const draft of drafts) {
        if (!draft.file) {
          await db.uploadFileDrafts.delete(draft.id!);
          toast(t('Dialog.SyncError'));
          return;
        }
        mutation.mutate(
          {
            data: {
              file: draft.file,
            },
          },
          {
            onSuccess: async () => {
              await db.uploadFileDrafts.delete(draft.id!);
              toast(t('Dialog.SyncSuccess'));
            },
            onError: async (e) => {
              // eslint-disable-next-line no-console
              console.error('Failed to sync offline data:', e);
              if (isOfnUploadNonconformant(e)) {
                void getOfnConformanceError(e).then((result) =>
                  setOfnIssues(result?.data),
                );
                return;
              }
              const errorMessage = getErrorMessage(e, tError);

              if (errorMessage) {
                await db.uploadFileDrafts.delete(draft.id!);
                toast(t('Dialog.DuplicateIRIRemoved'));
              } else {
                toast(t('Dialog.SyncError'));
              }
            },
          },
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Sync failed:', error);
    }
  };

  useEffect(() => {
    if (isOnline) {
      syncOfflineData();
    }
  }, [isOnline]);

  const onSubmit = async (data: UploadFromFileBody) => {
    setOfnIssues(undefined);
    setSubmitError(undefined);
    if (!isOnline) {
      try {
        const filePayload: UploadFromFileDraft = {
          file: data.file,
          createdAt: new Date(),
        };

        await db.uploadFileDrafts.add(filePayload);
        form.reset();
        toast(t('Dialog.OfflineUploadSuccess'));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to save offline:', error);
        toast(t('Dialog.OfflineUploadError'));
        return;
      }
    }

    mutation.mutate(
      {
        data: {
          file: data.file,
        },
      },
      {
        onError: (error) => {
          const decision = getMissingInSchemeError(error);
          if (decision) {
            setSubmitError(undefined);
            setDecisionRequired({
              file: data.file,
              graphName: decision.data.graphName,
              conceptsMissingInScheme: decision.data.conceptsMissingInScheme,
            });
            return;
          }
          if (isOfnUploadNonconformant(error)) {
            void getOfnConformanceError(error).then((result) =>
              setOfnIssues(result?.data),
            );
          }
        },
      },
    );
  };

  return (
    <FormSection label={t('Dialog.Title')} icon="file-earmark-ruled">
      {mutation.isPending ? (
        <div className="flex items-center justify-center">
          <CircularLoader />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 items-center justify-center"
        >
          <FileController
            name="file"
            form={form}
            translationNamespace="UploadOntology"
          />
          {submitError && <ErrorText text={submitError} />}
          {ofnIssues && (
            <section
              role="alert"
              aria-live="assertive"
              className="w-full space-y-3 rounded-lg border border-status-error-600 bg-status-error-100 p-4"
            >
              <header className="flex items-start gap-2">
                <GovIcon
                  type="components"
                  name="exclamation-triangle"
                  color="error"
                  className="mt-0.5 shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-status-error-700">
                    {t('OfnRejectedTitle')}
                  </h3>
                  {ofnIssues.message && (
                    <p className="text-sm">{ofnIssues.message}</p>
                  )}
                </div>
              </header>
              <div className="space-y-3 border-t border-status-error-600/30 pt-3">
                <p className="break-all font-medium">
                  {ofnIssues.vocabularyIri}
                </p>
                <OfnIssuesList issues={ofnIssues.issues} />
              </div>
            </section>
          )}

          <GovButton size="m" type="solid" color="primary" nativeType="submit">
            {t('Dialog.SubmitButton')}
          </GovButton>
        </form>
      )}
    </FormSection>
  );
};
