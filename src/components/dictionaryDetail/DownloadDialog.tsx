import { GovButton, GovDialog } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { downloadFile } from '@/api/generated';

interface DownloadDialogProps {
  open: boolean;
  onClose: () => void;
  ontologyID: number;
}

export const DownloadDialog = ({
  open,
  onClose,
  ontologyID,
}: DownloadDialogProps) => {
  const t = useTranslations('DownloadDialog');

  const handleDownload = async (format: 'json-ld' | 'ttl') => {
    try {
      const file = await downloadFile(ontologyID, { format });
      if (!file) {
        throw new Error('No file returned');
      }

      const url = window.URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = `file.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(t('Success', { format }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Download failed:', error);
      toast.error(t('Error'));
    } finally {
      onClose();
    }
  };

  return (
    <GovDialog
      open={open}
      onGovClose={onClose}
      labelTag="h2"
      className="fixed z-100"
    >
      <h2 slot="title">{t('Title')}</h2>
      <div className="flex items-end justify-end gap-2 w-full">
        <GovButton
          onGovClick={() => handleDownload('json-ld')}
          type="solid"
          color="primary"
        >
          JSON
        </GovButton>
        <GovButton
          onGovClick={() => handleDownload('ttl')}
          type="solid"
          color="primary"
        >
          TTL
        </GovButton>
      </div>
    </GovDialog>
  );
};
