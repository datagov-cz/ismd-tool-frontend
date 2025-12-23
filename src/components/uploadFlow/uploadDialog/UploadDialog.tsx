import { useEffect, useState } from 'react';
import { GovButton, GovDialog } from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  OntologyMetadataModel,
  UploadFromFileBody,
  useUploadFromFile,
} from '@/api/generated';
import { ErrorText } from '@/components/shared/ErrorText';
import { useIsOnline } from '@/hooks/useIsOnline';
import { db, type UploadFromFileDraft } from '@/lib/db';
import { uploadOntologySchema } from '@/lib/formSchemas';
import { getErrorMessage } from '@/utils/getErrorMessage';

import { ConfirmDialog } from './ConfirmDialog';
import { FileController } from './FileController';

interface UploadDialogProps {
  open: boolean;
  setOpen: (_value: boolean) => void;
  setSuccess: (_value: OntologyMetadataModel) => void;
}

export const UploadDialog = ({
  open,
  setOpen,
  setSuccess,
}: UploadDialogProps) => {
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const isOnline = useIsOnline();

  const t = useTranslations('UploadOntology');
  const tError = useTranslations('Errors');

  const mutation = useUploadFromFile({
    mutation: {
      onSuccess: (data) => {
        if (data.data) {
          setSubmitError(undefined);
          setSuccess(data.data);
          setOpen(false);
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

  const {
    handleSubmit,
    reset,
    formState: { dirtyFields },
  } = form;

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
            params: { userId: 'test' },
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
      console.error('Sync failed:', error);
    }
  };

  useEffect(() => {
    if (isOnline) {
      syncOfflineData();
    }
  }, [isOnline]);

  // TODO: add logged in user functionality
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
        console.error('Failed to save offline:', error);
        toast(t('Dialog.OfflineUploadError'));
        return;
      }
    }

    mutation.mutate({
      params: {
        userId: 'test',
      },
      data: {
        file: data.file,
      },
    });
  };

  const handleClose = () => {
    const dirty = Object.keys(dirtyFields).length > 0;
    if (!dirty) {
      setOpen(false);
      reset();
    } else {
      setConfirmDialog(true);
    }
  };

  return (
    <>
      <GovDialog
        open={open}
        onGovClose={() => handleClose()}
        labelTag="h2"
        title={t('Dialog.Title')}
      >
        <h2 slot="title" className="font-medium text-xl">
          {t('Dialog.Title')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FileController
            name="file"
            label={t('Dialog.FileInputLabel')}
            form={form}
            translationNamespace="UploadOntology"
          />
          {submitError && <ErrorText text={submitError} />}
          <div className="gap-2 flex justify-end w-full">
            <GovButton
              type="outlined"
              color="primary"
              nativeType="button"
              onGovClick={handleClose}
            >
              {t('Dialog.CancelButton')}
            </GovButton>
            <GovButton type="solid" color="primary" nativeType="submit">
              {t('Dialog.SubmitButton')}
            </GovButton>
          </div>
        </form>
      </GovDialog>

      <ConfirmDialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        handleUnsavedClose={() => {
          reset();
          setOpen(false);
          setConfirmDialog(false);
        }}
      />
    </>
  );
};
