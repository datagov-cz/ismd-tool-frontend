import { useState } from 'react';

import { OntologyMetadataModel } from '@/api/generated';

import { SuccessView } from './successDialog/SuccessView';
import { InSchemeDecisionData } from './uploadDialog/inSchemeDecision';
import { InSchemeDecisionDialog } from './uploadDialog/InSchemeDecisionDialog';
import { UploadDialog } from './uploadDialog/UploadDialog';

export const UploadFlow = () => {
  const [successData, setSuccessData] = useState<OntologyMetadataModel>();
  const [decisionData, setDecisionData] = useState<InSchemeDecisionData>();

  if (successData) {
    return (
      <SuccessView
        ontologyData={successData}
        onClose={() => setSuccessData(undefined)}
      />
    );
  }

  if (decisionData) {
    return (
      <InSchemeDecisionDialog
        data={decisionData}
        onSuccess={(value) => {
          setDecisionData(undefined);
          setSuccessData(value);
        }}
        onCancel={() => setDecisionData(undefined)}
      />
    );
  }

  return (
    <UploadDialog
      setSuccess={setSuccessData}
      setDecisionRequired={setDecisionData}
    />
  );
};
