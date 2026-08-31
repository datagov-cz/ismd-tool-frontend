import { GovButton, GovDialog } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  handleUnsavedClose: () => void;
}

export const ConfirmDialog = ({
  open,
  onClose,
  handleUnsavedClose,
}: ConfirmDialogProps) => {
  const t = useTranslations('UploadOntology');

  return (
    <GovDialog
      open={open}
      onClose={onClose}
      aria-label="confirm-close-dialog"
      className="[&_dialog]:max-w-125! [&_dialog]:z-110! [&_gov-backdrop_div]:z-105!"
      title={
        <h2 className="font-medium text-xl">
          {t('ConfirmCancelDialog.Title')}
        </h2>
      }
    >
      <div className="flex gap-2 justify-end">
        <GovButton
          type="outlined"
          color="primary"
          nativeType="button"
          onClick={onClose}
        >
          {t('ConfirmCancelDialog.NoButton')}
        </GovButton>
        <GovButton
          type="solid"
          color="primary"
          nativeType="button"
          onClick={handleUnsavedClose}
        >
          {t('ConfirmCancelDialog.YesButton')}
        </GovButton>
      </div>
    </GovDialog>
  );
};
