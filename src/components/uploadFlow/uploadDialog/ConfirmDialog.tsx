import { GovButton, GovDialog } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

export const ConfirmDialog = ({
  open,
  onClose,
  handleUnsavedClose,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  handleUnsavedClose: () => void;
}) => {
  const t = useTranslations('UploadOntology');

  return (
    <GovDialog
      open={open}
      onGovClose={onClose}
      aria-label="confirm-close-dialog"
      className="[&_dialog]:max-w-125! [&_dialog]:z-110! [&_gov-backdrop_div]:z-105!"
    >
      <h2 slot="title" className="font-medium text-xl">
        {t('ConfirmCancelDialog.Title')}
      </h2>
      <div className="flex gap-2 justify-end">
        <GovButton
          type="outlined"
          color="primary"
          nativeType="button"
          onGovClick={onClose}
        >
          {t('ConfirmCancelDialog.NoButton')}
        </GovButton>
        <GovButton
          type="solid"
          color="primary"
          nativeType="button"
          onGovClick={handleUnsavedClose}
        >
          {t('ConfirmCancelDialog.YesButton')}
        </GovButton>
      </div>
    </GovDialog>
  );
};
