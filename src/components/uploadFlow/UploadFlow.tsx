import { useState } from 'react';
import { GovButton } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { OntologyMetadataModel } from '@/api/generated';

import { SuccessDialog } from './successDialog/SuccessDialog';
import { UploadDialog } from './uploadDialog/UploadDialog';

export const UploadFlow = () => {
  const [open, setOpen] = useState(false);
  const [successData, setSuccessData] = useState<OntologyMetadataModel>();

  const t = useTranslations('Home');

  const handleCloseSuccess = () => {
    setOpen(false);
    setSuccessData(undefined);
  };

  return (
    <>
      <GovButton
        type="solid"
        size="m"
        color="primary"
        slot="button"
        onGovClick={() => setOpen(true)}
      >
        {t('MainControls.OpenDictFromFile')}
      </GovButton>
      <UploadDialog open={open} setOpen={setOpen} setSuccess={setSuccessData} />
      <SuccessDialog
        open={!!successData}
        onClose={handleCloseSuccess}
        ontologyData={successData || {}}
      />
    </>
  );
};
