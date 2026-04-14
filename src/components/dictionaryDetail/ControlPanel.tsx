'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

// import { ValidationReportDto } from '@/api/generated';
import { useCommentBoxStore } from '@/store/commentBoxStore';
import { useCreateConceptBoxStore } from '@/store/createConceptBoxStore';
import { useEditOntologyBoxStore } from '@/store/editOntologyBoxStore';
import { useUserInfo } from '../contexts/UserProvider';

import { ControlPanelButton } from './ControlPanelButton';
import { DeleteDialog } from './DeleteDialog';
import { DownloadDialog } from './DownloadDialog';

interface Props {
  // validationReport?: ValidationReportDto;
  isPublished: boolean;
  ontologyID: number;
  name: string;
  ownerId?: string;
}

export const ControlPanel = ({
  // validationReport,
  isPublished,
  ontologyID,
  name,
  ownerId,
}: Props) => {
  const [openDownload, setOpenDownload] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const t = useTranslations('DictionaryDetail.Main.ControlPanel');

  const { userInfo } = useUserInfo();
  const isUserAdmin = userInfo?.roles?.includes('admin');
  const isUserOwner = ownerId && userInfo?.userId === ownerId;

  const setIsCommentBoxOpen = useCommentBoxStore((state) => state.setIsOpen);
  const setIsConceptBoxOpen = useCreateConceptBoxStore(
    (state) => state.setIsOpen,
  );
  const setIsEditBoxOpen = useEditOntologyBoxStore((state) => state.setIsOpen);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast(t('LinkCopied'), { type: 'success' });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast(t('LinkCopyFailed'), { type: 'error' });
    }
  };

  return (
    <div className="sticky right-0 top-10 flex flex-col gap-2 h-fit">
      <ControlPanelButton
        iconName="gear"
        ariaLabel={t('GetLink')}
        onClick={() => setIsEditBoxOpen(true)}
        className="mb-10"
      />
      <ControlPanelButton
        iconName="link"
        ariaLabel={t('GetLink')}
        onClick={() => handleCopyLink()}
      />
      <ControlPanelButton
        iconName="message"
        ariaLabel={t('Comments')}
        onClick={() => setIsCommentBoxOpen(true)}
      />
      {/* TODO: Add validation report */}
      {/* <ControlPanelButton
        iconName={validationReport ? 'checkmark' : 'crossmark'}
        ariaLabel={
          validationReport?.valid
            ? t('ValidationPassed')
            : t('ValidationFailed')
        }
      /> */}
      <ControlPanelButton
        iconName="download"
        ariaLabel={t('Download')}
        onClick={() => setOpenDownload(true)}
      />
      {/* TODO: ask about this logic. Most likely creator of the ontology should be able to update it. */}
      {!isPublished && (isUserAdmin || isUserOwner) && (
        <ControlPanelButton
          iconName="trash"
          ariaLabel={t('Delete')}
          onClick={() => setOpenDelete(true)}
        />
      )}
      {(isUserAdmin || isUserOwner) && (
        <ControlPanelButton
          iconName="plus"
          ariaLabel={t('Add')}
          className="mt-12"
          onClick={() => setIsConceptBoxOpen(true)}
        />
      )}
      <DeleteDialog
        open={openDelete}
        ontologyID={ontologyID}
        onClose={() => setOpenDelete(false)}
        ontologyName={name}
      />
      <DownloadDialog
        ontologyID={ontologyID}
        open={openDownload}
        onClose={() => setOpenDownload(false)}
      />
    </div>
  );
};
