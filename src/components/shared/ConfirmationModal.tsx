'use client';

import { ReactNode } from 'react';

import { useOutsideClick } from '@/hooks/useOutsideClick';

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
  const ref = useOutsideClick(() => onClose());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={ref}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl overflow-hidden"
      >
        <div className="mb-4 text-lg">{children}</div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {cancelBtnText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
          >
            {confirmBtnText}
          </button>
        </div>
      </div>
    </div>
  );
};
