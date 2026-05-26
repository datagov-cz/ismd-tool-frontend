'use client';

import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { DownloadDialog } from './DownloadDialog';

interface Props {
  ontologyIRI: string;
}

export const ControlPanelNKD = ({ ontologyIRI }: Props) => {
  const [openDownload, setOpenDownload] = useState(false);
  const t = useTranslations('DictionaryDetail.Main.ControlPanel');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast(t('LinkCopied'), { type: 'success' });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy link:', error);
      toast(t('LinkCopyFailed'), { type: 'error' });
    }
  };

  return (
    <div className="flex flex-col gap-2 h-full w-fit justify-between items-end relative">
      <div className="flex">
        <GovButton
          nativeType="button"
          color="primary"
          type="base"
          size="s"
          onGovClick={() => setOpenDownload(true)}
        >
          <GovIcon
            name="download"
            size="l"
            slot="icon-start"
            type="components"
          />
          {t('Download')}
        </GovButton>
        <GovButton
          nativeType="button"
          color="primary"
          type="base"
          size="s"
          onGovClick={() => handleCopyLink()}
        >
          <GovIcon name="link" size="l" slot="icon-start" type="components" />
          {t('CopyLink')}
        </GovButton>
      </div>
      <DownloadDialog
        ontologyIRI={ontologyIRI}
        open={openDownload}
        onClose={() => setOpenDownload(false)}
        type="NKD"
      />
    </div>
  );
};
