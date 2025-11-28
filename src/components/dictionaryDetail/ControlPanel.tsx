'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import {
  OntologyMetadataModel,
  useValidateOntology,
  ValidationReportDto,
} from '@/api/generated';
import { useCommentBoxStore } from '@/store/commentBoxStore';
import { useValidationBoxStore } from '@/store/validationBoxStore';

import { ControlPanelButton } from './ControlPanelButton';
import { DeleteDialog } from './DeleteDialog';
import { DownloadDialog } from './DownloadDialog';
import { ValidationSidebox } from './ValidationSidebox';

interface Props {
  metadata: OntologyMetadataModel;
  isPublished: boolean;
  ontologyID: number;
  name: string;
}

export const ControlPanel = ({
  metadata,
  isPublished,
  ontologyID,
  name,
}: Props) => {
  const [openDownload, setOpenDownload] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [validationReport, setValidationReport] =
    useState<ValidationReportDto>();
  const t = useTranslations('DictionaryDetail.Main.ControlPanel');

  const validate = useValidateOntology();

  const setIsCommentBoxOpen = useCommentBoxStore((state) => state.setIsOpen);
  const setIsValidationBoxOpen = useValidationBoxStore(
    (state) => state.setIsOpen,
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast(t('LinkCopied'), { type: 'success' });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast(t('LinkCopyFailed'), { type: 'error' });
    }
  };

  const handleValidate = () => {
    validate.mutate(
      {
        data: metadata,
      },
      {
        onSuccess: (data) => {
          setValidationReport(data.data);
        },
      },
    );
  };

  useEffect(() => {
    handleValidate();
  }, []);

  return (
    <div className="sticky right-0 top-10 flex flex-col gap-2 h-fit">
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
      <ControlPanelButton
        iconName={
          validationReport?.results?.length === 0 ? 'checkmark' : 'crossmark'
        }
        ariaLabel={t('Validation')}
        onClick={() => setIsValidationBoxOpen(true)}
      />
      <ControlPanelButton
        iconName="download"
        ariaLabel={t('Download')}
        onClick={() => setOpenDownload(true)}
      />
      {!isPublished && (
        <ControlPanelButton
          iconName="trash"
          ariaLabel={t('Delete')}
          onClick={() => setOpenDelete(true)}
        />
      )}
      <ControlPanelButton
        iconName="plus"
        ariaLabel={t('Add')}
        className="mt-12"
      />
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
      <ValidationSidebox
        report={validationReport}
        revalidate={handleValidate}
        metadata={metadata}
      />
    </div>
  );
};
