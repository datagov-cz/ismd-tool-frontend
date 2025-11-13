import { GovButton, GovDialog } from '@gov-design-system-ce/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDeleteOntology } from '@/api/generated';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  ontologyID: number;
  ontologyName: string;
}

export const DeleteDialog = ({
  open,
  onClose,
  ontologyID,
  ontologyName,
}: DeleteDialogProps) => {
  const t = useTranslations('DeleteDialog');
  const router = useRouter();
  const deleteMutation = useDeleteOntology({
    mutation: {
      onSuccess: (data) => {
        toast(data.message, { type: 'success' });
        onClose();
        router.push('/');
      },
      onError: (error) => {
        console.error(error);
        toast(String(error), { type: 'error' });
      },
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate({ ontologyId: ontologyID });
  };

  return (
    <GovDialog labelTag="h2" onGovClose={() => onClose()} open={open}>
      <h2 slot="title">{t('Title')}</h2>
      <p>
        <span>{t('Name')}:</span> {ontologyName}
      </p>

      <div className="w-full flex gap-2 justify-end">
        <GovButton type="outlined" color="primary" onGovClick={() => onClose()}>
          {t('No')}
        </GovButton>
        <GovButton type="solid" color="error" onGovClick={() => handleDelete()}>
          {t('Yes')}
        </GovButton>
      </div>
    </GovDialog>
  );
};
