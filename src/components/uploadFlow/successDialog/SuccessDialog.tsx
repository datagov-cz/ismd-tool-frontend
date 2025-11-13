import { GovButton, GovDialog } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { OntologyMetadataModel } from '@/api/generated';

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  ontologyData: OntologyMetadataModel;
}

export const SuccessDialog = ({
  open,
  onClose,
  ontologyData,
}: SuccessDialogProps) => {
  const { id, graphName, slug } = ontologyData;
  const t = useTranslations('UploadOntology');

  return (
    <GovDialog
      open={open}
      onGovClose={onClose}
      labelTag="h2"
      title={t('Dialog.Title')}
    >
      <h2 slot="title" className="font-medium text-xl">
        {t('SuccessDialog.Title')}
      </h2>
      <div className="flex flex-col gap-4 pb-10">
        <p>
          <span className="font-bold">ID: </span>
          {id}
        </p>
        {graphName && (
          <div>
            <span className="font-bold">IRI: </span>
            <Link href={graphName}>{graphName}</Link>
          </div>
        )}
      </div>
      <div className="gap-2 flex justify-end w-full">
        <GovButton
          type="outlined"
          color="primary"
          nativeType="button"
          onGovClick={onClose}
        >
          {t('SuccessDialog.CloseDialog')}
        </GovButton>
        <GovButton type="solid" color="primary" href={`/dictionary/${slug}`}>
          {t('SuccessDialog.ViewOntology')}
        </GovButton>
      </div>
    </GovDialog>
  );
};
