import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';

import {
  OntologyMetadataModel,
  useValidateOntology,
  ValidationReportDto,
} from '@/api/generated';

export const ValidationSummary = ({
  slug,
  metaData,
}: {
  slug: string;
  metaData: OntologyMetadataModel;
}) => {
  const [validationReport, setValidationReport] =
    useState<ValidationReportDto>();
  const validate = useValidateOntology();

  const handleValidate = () => {
    validate.mutate(
      { slug: slug, data: metaData },
      {
        onSuccess: (data) => {
          setValidationReport(data.data);
        },
      },
    );
  };

  if (!validationReport)
    return (
      <div className="col-span-4 flex flex-col items-center">
        <p className="font-medium text-lg mb-3">
          Slovník ještě nebyl zvalidován
        </p>
        <GovButton
          type="solid"
          color="primary"
          size="s"
          onGovClick={handleValidate}
        >
          <GovIcon
            slot="icon-start"
            name="shield-check"
            size="s"
            className="text-white"
          />
          Spustit validaci
        </GovButton>
      </div>
    );

  return <div>report</div>;
};
