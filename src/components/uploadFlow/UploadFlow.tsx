import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
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
        type="outlined"
        size="m"
        color="secondary"
        slot="button"
        onGovClick={() => setOpen(true)}
      >
        <GovIcon
          type="components"
          color="secondary"
          name="upload"
          slot="icon-start"
          size="m"
          className="transition-transform duration-200"
        />
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
