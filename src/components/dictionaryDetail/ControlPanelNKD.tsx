'use client';

import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { DownloadDialog } from './DownloadDialog';

interface Props {
  ontologyID: number;
}

export const ControlPanelNKD = ({ ontologyID }: Props) => {
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
    <div className="flex gap-2 h-fit w-full justify-start relative">
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
          Stáhnout
        </GovButton>
        <GovButton
          nativeType="button"
          color="primary"
          type="base"
          size="s"
          onGovClick={() => handleCopyLink()}
        >
          <GovIcon name="link" size="l" slot="icon-start" type="components" />
          Kopírovat odkaz
        </GovButton>
      </div>
      <DownloadDialog
        ontologyID={ontologyID}
        open={openDownload}
        onClose={() => setOpenDownload(false)}
      />
    </div>
  );
};
