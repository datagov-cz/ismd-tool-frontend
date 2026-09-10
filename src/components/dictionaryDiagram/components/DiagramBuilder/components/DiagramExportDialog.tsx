import { GovButton, GovDialog, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

type DiagramExportDialogProps = {
  isExporting: boolean;
  onClose: () => void;
  onExport: (_scope: 'diagram' | 'viewport') => void;
  open: boolean;
};

export const DiagramExportDialog = ({
  isExporting,
  onClose,
  onExport,
  open,
}: DiagramExportDialogProps) => {
  const t = useTranslations('DictionaryDiagram.Export');
  return (
    <GovDialog open={open} onGovClose={onClose}>
      <span slot="title" className="flex items-center gap-3">
        <GovIcon name="download" color="primary" size="xl" />
        {t('Title')}
      </span>

      <p>{t('Description')}</p>

      <div slot="footer" className="flex flex-wrap justify-end gap-2">
        <GovButton
          color="neutral"
          type="outlined"
          nativeType="button"
          disabled={isExporting}
          onGovClick={onClose}
        >
          {t('Cancel')}
        </GovButton>
        <GovButton
          color="primary"
          type="outlined"
          nativeType="button"
          disabled={isExporting}
          onGovClick={() => onExport('viewport')}
        >
          {t('Viewport')}
        </GovButton>
        <GovButton
          color="primary"
          type="solid"
          nativeType="button"
          disabled={isExporting}
          onGovClick={() => onExport('diagram')}
        >
          {t('WholeDiagram')}
        </GovButton>
      </div>
    </GovDialog>
  );
};
