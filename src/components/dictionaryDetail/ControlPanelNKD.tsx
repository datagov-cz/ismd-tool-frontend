'use client';

import { useState } from 'react';
import { GovButton, GovDropdown, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { DownloadDialog } from './DownloadDialog';

interface Props {
  ontologyIRI: string;
}

export const ControlPanelNKD = ({ ontologyIRI }: Props) => {
  const [openDownload, setOpenDownload] = useState(false);
  const t = useTranslations('DictionaryDetail.Main.ControlPanel');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
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

        <GovDropdown id="copy-link-ismd" position="left">
          <GovButton
            color="primary"
            type="base"
            size="m"
            className="h-8! [&_button]:h-8!"
          >
            <GovIcon
              name="link"
              size="m"
              aria-label={t('GetLink')}
              className="text-white"
            />
            {t('CopyLink')}
          </GovButton>

          <ul slot="list">
            {ontologyIRI && (
              <GovButton
                color="primary"
                type="base"
                size="s"
                onGovClick={() => copyToClipboard(ontologyIRI)}
                className="w-full! [&_button]:w-full! max-w-none!"
              >
                {t('CopyIRI')}
              </GovButton>
            )}
            <GovButton
              color="primary"
              type="base"
              size="s"
              onGovClick={() => copyToClipboard(window.location.href)}
              className="w-full! [&_button]:w-full! max-w-none!"
            >
              {t('CopyURL')}
            </GovButton>
          </ul>
        </GovDropdown>
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
