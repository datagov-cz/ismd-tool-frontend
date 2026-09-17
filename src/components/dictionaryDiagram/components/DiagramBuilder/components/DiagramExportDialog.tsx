import { useState } from 'react';
import { GovButton, GovDialog, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

export type DiagramExportFormat = 'png' | 'svg';
export type DiagramExportBackground = 'transparent' | 'white';
export type DiagramExportPhase =
  | 'idle'
  | 'rendering'
  | 'optimizing'
  | 'downloading';

type DiagramExportDialogProps = {
  exportPhase: DiagramExportPhase;
  onClose: () => void;
  onExport: (
    _scope: 'diagram' | 'viewport',
    _format: DiagramExportFormat,
    _background: DiagramExportBackground,
  ) => Promise<void>;
  open: boolean;
};

export const DiagramExportDialog = ({
  exportPhase,
  onClose,
  onExport,
  open,
}: DiagramExportDialogProps) => {
  const t = useTranslations('DictionaryDiagram.Export');
  const [format, setFormat] = useState<DiagramExportFormat>('png');
  const [background, setBackground] =
    useState<DiagramExportBackground>('white');
  const [exportingScope, setExportingScope] = useState<
    'diagram' | 'viewport' | null
  >(null);
  const isExporting = exportPhase !== 'idle' || exportingScope !== null;

  const startExport = async (scope: 'diagram' | 'viewport') => {
    setExportingScope(scope);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    try {
      await onExport(scope, format, background);
    } finally {
      setExportingScope(null);
    }
  };

  return (
    <GovDialog
      open={open}
      onGovClose={() => {
        if (!isExporting) onClose();
      }}
    >
      <span slot="title" className="flex items-center gap-3">
        <GovIcon name="download" color="primary" size="xl" />
        {t('Title')}
      </span>

      <p>{t('Description')}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 font-bold">{t('Format')}</legend>
          {(['png', 'svg'] as const).map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name="diagram-export-format"
                value={value}
                checked={format === value}
                disabled={isExporting}
                onChange={() => setFormat(value)}
                className="size-4 accent-blue-primary"
              />
              {t(value === 'png' ? 'FormatPng' : 'FormatSvg')}
            </label>
          ))}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 font-bold">{t('Background')}</legend>
          {(['white', 'transparent'] as const).map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name="diagram-export-background"
                value={value}
                checked={background === value}
                disabled={isExporting}
                onChange={() => setBackground(value)}
                className="size-4 accent-blue-primary"
              />
              {t(
                value === 'white' ? 'BackgroundWhite' : 'BackgroundTransparent',
              )}
            </label>
          ))}
        </fieldset>
      </div>

      {isExporting && (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 flex items-center gap-3 rounded-md bg-primary-subtlest p-4 font-bold text-blue-primary"
        >
          <GovIcon
            type="components"
            name="loader"
            color="primary"
            className="animate-spin"
          />
          <span>
            {t(
              exportPhase === 'idle'
                ? 'Preparing'
                : exportPhase === 'rendering'
                  ? 'Rendering'
                  : exportPhase === 'optimizing'
                    ? 'Optimizing'
                    : 'Downloading',
            )}
          </span>
        </div>
      )}

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
          loading={
            isExporting && exportingScope === 'viewport' ? 'true' : undefined
          }
          onGovClick={() => void startExport('viewport')}
        >
          {isExporting && exportingScope === 'viewport'
            ? t('Preparing')
            : t('Viewport')}
        </GovButton>
        <GovButton
          color="primary"
          type="solid"
          nativeType="button"
          disabled={isExporting}
          loading={
            isExporting && exportingScope === 'diagram' ? 'true' : undefined
          }
          onGovClick={() => void startExport('diagram')}
        >
          {isExporting && exportingScope === 'diagram'
            ? t('Preparing')
            : t('WholeDiagram')}
        </GovButton>
      </div>
    </GovDialog>
  );
};
