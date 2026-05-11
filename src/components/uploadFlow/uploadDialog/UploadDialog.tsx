import { useEffect, useState } from 'react';
import { GovButton } from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  OntologyMetadataModel,
  UploadFromFileBody,
  useUploadFromFile,
} from '@/api/generated';
import { CircularLoader } from '@/components/shared/CircularLoader';
import { ErrorText } from '@/components/shared/ErrorText';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';
import { db, type UploadFromFileDraft } from '@/lib/db';
import { uploadOntologySchema } from '@/lib/formSchemas';
import { getErrorMessage } from '@/utils/getErrorMessage';

import { FileController } from './FileController';

interface UploadDialogProps {
  setSuccess: (_value: OntologyMetadataModel) => void;
}

export const UploadDialog = ({ setSuccess }: UploadDialogProps) => {
  const [submitError, setSubmitError] = useState<string>();

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

    mutation.mutate({
      data: {
        file: data.file,
      },
    });
  };

  return (
    <>
      <div className="w-full space-y-10 bg-page-background p-6 rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3)] flex flex-col items-center">
        <h2 slot="title" className="font-medium text-lg w-fit">
          {t('Dialog.Title')}
        </h2>

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

            <GovButton type="solid" color="primary" nativeType="submit">
              {t('Dialog.SubmitButton')}
            </GovButton>
          </form>
        )}
      </div>
    </>
  );
};
