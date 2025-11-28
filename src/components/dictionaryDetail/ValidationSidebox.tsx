'use client';

import { GovButton } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import {
  OntologyMetadataModel,
  useRequestCatalogRecord,
  ValidationReport,
} from '@/api/generated';
import { useValidationBoxStore } from '@/store/validationBoxStore';
import { Sidebox } from '../shared/Sidebox';
import { reportSorting } from '../validationReport/reportSorting';
import { ValidationGroup } from '../validationReport/ValidationGroup';

interface ValidationSideboxProps {
  report?: ValidationReport;
  revalidate: () => void;
  metadata: OntologyMetadataModel;
}

export const ValidationSidebox = ({
  report,
  revalidate,
  metadata,
}: ValidationSideboxProps) => {
  const t = useTranslations('DictionaryDetail.ValidationSidebox');

  const isOpen = useValidationBoxStore((state) => state.isOpen);
  const setIsOpen = useValidationBoxStore((state) => state.setIsOpen);
  const catalogReport = useRequestCatalogRecord();

  if (!report) return null;

  const date = report.timestamp && new Date(report.timestamp);

  const formattedDate = date?.toLocaleString('cs-CZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCatalogReport = () =>
    catalogReport.mutate(
      {
        data: {
          validationReport: report,
          ontologyMetadata: metadata,
        },
      },
      {
        onSuccess: (data) => {
          try {
            const file = data.data || data;

            if (!file) {
              throw new Error('No file returned');
            }

            const jsonString =
              typeof file === 'string' ? file : JSON.stringify(file, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `catalog-report.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success(t('DownloadSuccess'), { position: 'bottom-right' });
          } catch (error) {
            console.error('Download failed:', error);
            toast.error(t('DownloadError'), { position: 'bottom-right' });
          }
        },
        onError: () =>
          toast.error(t('DownloadError'), { position: 'bottom-right' }),
      },
    );

  const sortedGroups = reportSorting(report);

  return (
    <Sidebox title={t('Title')} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="mt-4 flex-1 overflow-scroll flex flex-col h-full p-4 pt-0">
        <p className="mb-2 text-sm">
          {t('DateOfControl')}
          {formattedDate}
        </p>
        <div className="space-y-10">
          {sortedGroups?.map((group, index) => (
            <ValidationGroup
              key={index}
              focusNodeName={group.focusNodeName}
              severityGroups={group.severityGroups}
              ontologySlug={metadata.slug || ''}
            />
          ))}
        </div>
      </div>
      <div className="w-full flex gap-4 pt-5 justify-end">
        <GovButton
          nativeType="button"
          type="outlined"
          color="primary"
          onGovClick={() => handleCatalogReport()}
        >
          {t('Download')}
        </GovButton>
        <GovButton
          nativeType="button"
          onGovClick={revalidate}
          type="solid"
          color="primary"
        >
          {t('Revalidate')}
        </GovButton>
      </div>
    </Sidebox>
  );
};
