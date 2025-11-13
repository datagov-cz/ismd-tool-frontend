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
      onGovClose={() => onClose()}
      labelTag="h2"
      open={isOpen}
      className="[&_dialog]:max-w-1/2!"
    >
      <h2 slot="title">{children}</h2>
      <div className="w-full flex gap-3 justify-end">
        <GovButton
          color="primary"
          type="outlined"
          nativeType="button"
          onGovClick={() => onClose()}
        >
          {cancelBtnText}
        </GovButton>
        <GovButton
          color="error"
          type="solid"
          nativeType="button"
          onGovClick={() => onConfirm()}
        >
          {confirmBtnText}
        </GovButton>
      </div>
    </GovDialog>
  );
};
