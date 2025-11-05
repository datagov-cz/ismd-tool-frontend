import { useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { CommentModel } from '@/api/generated';
import { ConfirmationModal } from '../shared/ConfirmationModal';

interface Props extends CommentModel {
  loggedUser: string;
}

export const CommentItem = ({
  // id,
  userId,
  comment,
  // ontologyIRI,
  // conceptIRI,
  loggedUser,
}: Props) => {
  const t = useTranslations('DictionaryDetail.CommentSidebox');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDelete = () => {
    if (loggedUser !== userId) {
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className="flex flex-col gap-y-2 p-2 [&:not(:last-child))]:border-b border-secondary">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          {/* {new Date(dateTime).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          })} */}
        </div>
        <button
          className={clsx(
            'outline-blue dark:outline-white/60 flex items-center justify-center p-1 outline-1 rounded-md hover:bg-blue/20 dark:hover:bg-blue-hover transition-colors duration-200 mr-2',
            userId !== loggedUser ? 'hidden' : '',
          )}
          onClick={handleDelete}
        >
          <GovIcon name="trash" size="m" />
        </button>
      </div>
      <p className="mt-1 text-sm whitespace-pre-wrap line-clamp-3">{comment}</p>

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
