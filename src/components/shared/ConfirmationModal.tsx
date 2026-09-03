'use client';

import { ReactNode } from 'react';
import { GovButton, GovDialog } from '@gov-design-system-ce/react';

interface Props {
  isOpen: boolean;
  cancelBtnText: string;
  confirmBtnText: string;
  onClose: () => void;
  onConfirm: () => void;
  children: ReactNode;
}

export const ConfirmationModal = ({
  isOpen,
  cancelBtnText,
  confirmBtnText,
  onClose,
  onConfirm,
  children,
}: Props) => {
  return (
    <GovDialog
      onClose={() => onClose()}
      open={isOpen}
      className="[&_dialog]:max-w-1/2!"
      title={<h2>{children}</h2>}
    >
      <div className="w-full flex gap-3 justify-end">
        <GovButton
          size="m"
          color="primary"
          type="outlined"
          nativeType="button"
          onClick={() => onClose()}
        >
          {cancelBtnText}
        </GovButton>
        <GovButton
          size="m"
          color="error"
          type="solid"
          nativeType="button"
          onClick={() => onConfirm()}
        >
          {confirmBtnText}
        </GovButton>
      </div>
    </GovDialog>
  );
};
