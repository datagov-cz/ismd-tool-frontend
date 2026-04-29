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

  return (
    <div className="w-fit mx-auto">
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
          <GovButton type="outlined" color="primary">
            <GovIcon
              type="components"
              name="upload"
              slot="icon-start"
              size="m"
            />
            {t('FileUpload.Upload')}
          </GovButton>
          <p className="opacity-60 text-sm pt-2">{t('FileUpload.Supported')}</p>
        </div>
      </GovFormFile>
      {error && <p className="text-red-600 text-sm mt-1">{error.message}</p>}
    </div>
  );
};
