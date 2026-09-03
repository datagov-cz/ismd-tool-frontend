import { useCallback } from 'react';
import { GovButton, GovFormFile, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import {
  FieldValues,
  Path,
  useController,
  UseFormReturn,
} from 'react-hook-form';

import { UploadFromFileBody } from '@/api/generated';

type FileControllerProps<TForm extends FieldValues> = {
  form: UseFormReturn<TForm>;
  name: Path<TForm>;
  accept?: string;
  translationNamespace?: string;
};

const DEFAULT_ACCEPTED_FILE_TYPES =
  '.jsonld,application/ld+json,.ttl,text/turtle,.json,.json-ld, ';

export const FileController = ({
  form,
  name,
  accept,
  translationNamespace,
}: FileControllerProps<UploadFromFileBody>) => {
  const {
    field: { onChange },
    fieldState: { error },
  } = useController({ control: form.control, name });

  const t = useTranslations(translationNamespace);
  const acceptedTypes = accept || DEFAULT_ACCEPTED_FILE_TYPES;

  const applyNativeAttributes = useCallback(
    (input: HTMLInputElement | null) => {
      input?.setAttribute('accept', acceptedTypes);
      input?.setAttribute('required', '');
    },
    [acceptedTypes],
  );

  return (
    <div className="w-fit mx-auto">
      <GovFormFile
        ref={applyNativeAttributes}
        expanded
        accept={acceptedTypes}
        onFilesUpdated={(files) => {
          const addedFile = files[0]?.file;

          if (addedFile) {
            onChange(addedFile);
            return;
          }

          form.reset();
        }}
        id={name}
        multiple={false}
        required={true}
      >
        <div>
          <GovButton
            size="m"
            type="outlined"
            color="primary"
            iconStart={<GovIcon type="components" name="upload" size="m" />}
          >
            {t('FileUpload.Upload')}
          </GovButton>
          <p className="opacity-60 text-sm pt-2">{t('FileUpload.Supported')}</p>
        </div>
      </GovFormFile>
      {error && (
        <p className="text-status-error-600 text-sm mt-1">{error.message}</p>
      )}
    </div>
  );
};
