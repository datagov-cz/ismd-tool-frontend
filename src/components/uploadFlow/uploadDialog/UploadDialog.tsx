import { useState } from 'react';
import { GovButton, GovDialog } from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import {
  OntologyMetadataModel,
  UploadFromFileBody,
  useUploadFromFile,
} from '@/api/generated';
import { ErrorText } from '@/components/shared/ErrorText';
import { uploadOntologySchema } from '@/lib/formSchemas';
import { getErrorMessage } from '@/utils/getErrorMessage';

import { ConfirmDialog } from './ConfirmDialog';
import { FileController } from './FileController';

interface UploadDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  setSuccess: (value: OntologyMetadataModel) => void;
}

export const UploadDialog = ({
  open,
  setOpen,
  setSuccess,
}: UploadDialogProps) => {
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

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

  // TODO: add logged in user functionality
  const onSubmit = (data: UploadFromFileBody) => {
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
        }}
      />
    </>
  );
};
