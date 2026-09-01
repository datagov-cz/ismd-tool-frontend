import { GovButton, GovDialog } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { downloadFile, downloadNkdOntology } from '@/api/generated';
import { getBlobErrorMessage } from '@/utils/getErrorMessage';

type DownloadDialogProps = {
  open: boolean;
  onClose: () => void;
  ontologyName: string;
} & (
  | { type: 'ISMD'; ontologyID: number; ontologyIRI?: never }
  | { type: 'NKD'; ontologyIRI: string; ontologyID?: never }
);

export const DownloadDialog = ({
  open,
  onClose,
  ontologyID,
  ontologyIRI,
  type,
  ontologyName,
}: DownloadDialogProps) => {
  const t = useTranslations('DownloadDialog');
  const tError = useTranslations('Errors');

  const handleDownload = async (format: 'json-ld' | 'ttl') => {
    try {
      const file = await (type === 'ISMD'
        ? downloadFile(ontologyID, { format })
        : downloadNkdOntology({ iri: ontologyIRI, format }));
      if (!file) {
        throw new Error('No file returned');
      }

      const url = window.URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ontologyName}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(t('Success', { format }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Download failed:', error);
      toast.error(await getBlobErrorMessage(error, tError));
    } finally {
      onClose();
    }
  };

  return (
    <GovDialog
      open={open}
      onClose={onClose}
      className="fixed z-100"
      title={<h2>{t('Title')}</h2>}
    >
      <div className="flex items-end justify-end gap-2 w-full">
        <GovButton
          size="m"
          onClick={() => handleDownload('json-ld')}
          type="solid"
          color="primary"
        >
          JSON
        </GovButton>
        <GovButton
          size="m"
          onClick={() => handleDownload('ttl')}
          type="solid"
          color="primary"
        >
          TTL
        </GovButton>
      </div>
    </GovDialog>
  );
};
