import { useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { ConfirmationModal } from '../shared/ConfirmationModal';

interface Props {
  dateTime: Date;
  text: string;
  author: string;
  user: string;
}

export const CommentItem = ({ dateTime, text, author, user }: Props) => {
  const t = useTranslations('DictionaryDetail.CommentSidebox');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDelete = () => {
    if (user !== author) {
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    console.log('Delete comment');
    setShowConfirmModal(false);
  };

  return (
    <div className="flex flex-col gap-y-2 p-2">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          {new Date(dateTime).toLocaleDateString()}
        </div>
        <button
          className={`outline-blue dark:outline-white/60 flex items-center justify-center p-1 outline-1 rounded-md hover:bg-blue/20 dark:hover:bg-blue-hover transition-colors duration-200 mr-2 ${author !== user ? 'hidden' : ''}`}
          onClick={handleDelete}
        >
          <GovIcon name="trash" size="m" />
        </button>
      </div>
      <p className="mt-1 text-sm whitespace-pre-wrap line-clamp-3">{text}</p>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        cancelBtnText={t('DeleteCommentConfirmModal.CancelButton')}
        confirmBtnText={t('DeleteCommentConfirmModal.ConfirmButton')}
      >
        {t('DeleteCommentConfirmModal.Description')}
      </ConfirmationModal>
    </div>
  );
};
