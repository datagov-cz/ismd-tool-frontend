import { useState } from 'react';
import { GovButton, GovDialog } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import {
  downloadFile,
  downloadNkdOntology,
  useGetOntologyDetail,
} from '@/api/generated';
import { OfnIssuesList } from '@/components/shared/OfnIssuesList';
import { getBlobErrorMessage } from '@/utils/getErrorMessage';
import { getOfnConformanceError, OfnIssuesData } from '@/utils/ofnConformance';

type DownloadDialogProps = {
  open: boolean;
  onClose: () => void;
  ontologyName: string;
} & (
  | {
      type: 'ISMD';
      ontologyID: number;
      ontologySlug?: string;
      ontologyIRI?: never;
    }
  | {
      type: 'NKD';
      ontologyIRI: string;
      ontologyID?: never;
      ontologySlug?: never;
    }
);

export const DownloadDialog = ({
  open,
  onClose,
  ontologyID,
  ontologyIRI,
  type,
  ontologyName,
  ontologySlug,
}: DownloadDialogProps) => {
  const [blockedIssues, setBlockedIssues] = useState<OfnIssuesData>();
  const t = useTranslations('DownloadDialog');
  const tError = useTranslations('Errors');
  const { data: ontology } = useGetOntologyDetail(ontologySlug ?? '', {
    query: { enabled: open && type === 'ISMD' && Boolean(ontologySlug) },
  });

  const conceptHref = (conceptIri: string) => {
    if (type === 'NKD') {
      return `/concept/nkd?iri=${encodeURIComponent(conceptIri)}`;
    }
    const concept = ontology?.data?.ontologyMetadata?.concepts?.find(
      (item) => item.conceptIri === conceptIri,
    );
    return concept?.slug
      ? `/concept/${encodeURIComponent(concept.slug)}`
      : undefined;
  };

  const handleDownload = async (format: 'json-ld' | 'ttl') => {
    setBlockedIssues(undefined);
    let keepOpen = false;
    try {
      const file = await (type === 'ISMD'
        ? downloadFile(ontologyID, { format })
        : downloadNkdOntology({ iri: ontologyIRI, format }));
      if (!file) {
        throw new Error('No file returned');
      }

      const url = window.URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ontologyName}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(t('Success', { format }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Download failed:', error);
      const ofnError = await getOfnConformanceError(error, true);
      if (ofnError) {
        setBlockedIssues(ofnError.data);
        keepOpen = true;
      } else {
        toast.error(await getBlobErrorMessage(error, tError));
      }
    } finally {
      if (!keepOpen) onClose();
    }
  };

  const handleClose = () => {
    setBlockedIssues(undefined);
    onClose();
  };

  return (
    <GovDialog
      open={open}
      onClose={handleClose}
      className="fixed z-100"
      title={<h2>{blockedIssues ? t('OfnBlockedTitle') : t('Title')}</h2>}
    >
      {blockedIssues ? (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {blockedIssues.message && <p>{blockedIssues.message}</p>}
          <p>{blockedIssues.vocabularyIri}</p>
          <OfnIssuesList
            issues={blockedIssues.issues}
            conceptHref={conceptHref}
          />
          <div className="flex justify-end">
            <GovButton
              size="m"
              onClick={handleClose}
              type="solid"
              color="primary"
            >
              {t('Close')}
            </GovButton>
          </div>
        </div>
      ) : (
        <div className="flex items-end justify-end gap-2 w-full">
          <GovButton
            size="m"
            onClick={() => handleDownload('json-ld')}
            type="solid"
            color="primary"
          >
            JSON
          </GovButton>
          <GovButton
            size="m"
            onClick={() => handleDownload('ttl')}
            type="solid"
            color="primary"
          >
            TTL
          </GovButton>
        </div>
      )}
    </GovDialog>
  );
};
