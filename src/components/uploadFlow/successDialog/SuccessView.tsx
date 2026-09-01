import { GovButton } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { OntologyMetadataModel } from '@/api/generated';

interface SuccessViewProps {
  onClose: () => void;
  ontologyData: OntologyMetadataModel;
}

export const SuccessView = ({ onClose, ontologyData }: SuccessViewProps) => {
  const { id, graphName, slug } = ontologyData;
  const t = useTranslations('UploadOntology');

  return (
    <div className="w-full space-y-10 bg-surface-muted p-6 rounded-lg shadow-raised">
      <h2 className="font-medium text-xl">{t('SuccessDialog.Title')}</h2>

      <div className="flex flex-col gap-4 pb-4">
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
          size="m"
          type="outlined"
          color="primary"
          nativeType="button"
          onClick={onClose}
        >
          {t('SuccessDialog.CloseDialog')}
        </GovButton>
        <GovButton
          size="m"
          type="solid"
          color="primary"
          href={`${process.env.NEXT_PUBLIC_BASE_PATH}/dictionary/${slug}`}
        >
          {t('SuccessDialog.ViewOntology')}
        </GovButton>
      </div>
    </div>
  );
};
