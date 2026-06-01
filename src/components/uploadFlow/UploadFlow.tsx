import { useState } from 'react';

import { OntologyMetadataModel } from '@/api/generated';

import { SuccessView } from './successDialog/SuccessView';
import { UploadDialog } from './uploadDialog/UploadDialog';

export const UploadFlow = () => {
  const [successData, setSuccessData] = useState<OntologyMetadataModel>();

  if (successData) {
    return (
      <SuccessView
        ontologyData={successData}
        onClose={() => setSuccessData(undefined)}
      />
    );
  }

  return <UploadDialog setSuccess={setSuccessData} />;
};
