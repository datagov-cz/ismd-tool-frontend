import {
  GovButton,
  GovFormFile,
  GovFormLabel,
} from '@gov-design-system-ce/react';
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
  label: string;
  accept?: string;
  translationNamespace?: string;
};

const DEFAULT_ACCEPTED_FILE_TYPES =
  '.jsonld,application/ld+json,.ttl,text/turtle,.json, ';

export const FileController = ({
  form,
  name,
  label,
  accept,
  translationNamespace,
}: FileControllerProps<UploadFromFileBody>) => {
  const {
    field: { onChange },
    fieldState: { error },
  } = useController({ control: form.control, name });

  const t = useTranslations(translationNamespace);

  return (
    <div>
      <GovFormLabel>{label}</GovFormLabel>
      <GovFormFile
        expanded
        accept={accept || DEFAULT_ACCEPTED_FILE_TYPES}
        onGovAddFile={(e) => {
          const firstAttachment = e.target.querySelector(
            '.gov-attachments-item__file',
          );
          firstAttachment?.remove();

          const addedFile = e.detail?.file?.file;
          if (addedFile) {
            onChange(addedFile);
          }
        }}
        id={name}
        multiple={false}
        required={true}
        onGovRemoveFile={() => form.reset()}
      >
        <div>
          <p>{t('FileUpload.Drag')}</p>
          <GovButton type="outlined" color="primary">
            {t('FileUpload.Upload')}
          </GovButton>
        </div>
      </GovFormFile>
      {error && <p className="text-red-600 text-sm mt-1">{error.message}</p>}
    </div>
  );
};
