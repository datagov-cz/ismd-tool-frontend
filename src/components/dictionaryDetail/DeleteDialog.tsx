import { GovButton, GovDialog } from '@gov-design-system-ce/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useDeleteConcept, useDeleteOntology } from '@/api/generated';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  id: number;
  name: string;
  type: 'ONTOLOGY' | 'CONCEPT';
}

export const DeleteDialog = ({
  open,
  onClose,
  id,
  name,
  type,
}: DeleteDialogProps) => {
  const t = useTranslations('DeleteDialog');
  const router = useRouter();
  const ontologyMutation = useDeleteOntology({
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

  const conceptMutation = useDeleteConcept({
    mutation: {
      onSuccess: (data) => {
        toast(data.message, { type: 'success' });
        onClose();
        router.push('/');
      },
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        toast(String(error), { type: 'error' });
      },
    },
  });

  const handleDelete = () => {
    if (type === 'ONTOLOGY') {
      ontologyMutation.mutate({ ontologyId: id });
    } else {
      conceptMutation.mutate({ conceptId: id });
    }
  };

  return (
    <GovDialog
      labelTag="h2"
      onGovClose={() => onClose()}
      open={open}
      className="fixed z-100"
    >
      <h2 slot="title">{t('Title')}</h2>
      <p>
        <span>{t('Name')}:</span> {name}
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
