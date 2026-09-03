import { useState } from 'react';
import { GovButton, GovChip, GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import {
  ConceptDetailModelReferencovanéPojmyResolved,
  PublishedConceptDeviationModel,
  useSyncWorkingCopy,
  useUpdateLocalCopy,
} from '@/api/generated';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';
import { getErrorMessage } from '@/utils/getErrorMessage';

import { DeviationKey } from './deviation.types';
import { formatKey } from './deviation.utils';
import { DeviationItem } from './DeviationItem';

export const DeviationGroup = ({
  keys,
  deviations,
  resolved,
  conceptId,
  snapshotId,
  conceptLabel,
}: {
  keys: DeviationKey[];
  deviations: PublishedConceptDeviationModel;
  resolved?: ConceptDetailModelReferencovanéPojmyResolved;
  conceptId: number;
  snapshotId?: number;
  conceptLabel?: string;
}) => {
  const t = useTranslations('ConceptDeviations');
  const tError = useTranslations('Errors');
  const [expanded, setExpanded] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<DeviationKey[]>([]);

  const mutation = useUpdateLocalCopy();
  const mutationSync = useSyncWorkingCopy();

  const allSelected = selectedKeys.length === keys.length;

  const invalidator = useQueryInvalidator();

  const toggleKey = (key: DeviationKey) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const toggleAll = () => {
    setSelectedKeys(allSelected ? [] : [...keys]);
  };

  const handleUpdateLocalCopy = () => {
    if (!snapshotId) return null;
    mutation.mutate(
      { conceptId, snapshotId },
      {
        onSuccess: () => {
          setExpanded(false);
        },
        onError: (error) => {
          console.error('Failed to update local copy', error);
          toast(getErrorMessage(error, tError), {
            position: 'bottom-right',
            type: 'error',
          });
        },
      },
    );
  };

  const handleSubmitSelected = () => {
    if (!selectedKeys.length) return;

    mutationSync.mutate(
      { conceptId, data: { fieldsToAccept: selectedKeys } },
      {
        onSuccess: (data) => {
          invalidator.invalidateConcept(
            decodeURIComponent(data.data?.conceptMetadata?.slug || ''),
          );
          invalidator.invalidateOntology(
            data.data?.conceptMetadata?.ontologySlug ?? '',
          );
          setExpanded(false);
        },
        onError: (error) => {
          console.error('Failed to update local copy', error);
          toast(getErrorMessage(error, tError), {
            position: 'bottom-right',
            type: 'error',
          });
        },
      },
    );
  };

  const completeResolved = {
    ...resolved,
    ...deviations['referencované-pojmy-resolved'],
  };

  return (
    <div className="p-2 border border-border-primary-subtle rounded-sm space-y-2 bg-surface">
      <span className="text-sm font-bold mb-3 block">
        {t(snapshotId ? 'DifferencesLabelConcept' : 'DifferencesLabel')}{' '}
        {conceptLabel && (
          <span className="text-accent font-bold">{conceptLabel}</span>
        )}
      </span>

      {!expanded ? (
        <div className="flex flex-wrap gap-1">
          {keys.map((item) => (
            <GovChip key={item} color="primary" type="outlined" size="s">
              {formatKey(item)}
            </GovChip>
          ))}
        </div>
      ) : (
        keys.map((item) => (
          <DeviationItem
            key={item}
            propertyKey={item}
            data={deviations[item]}
            resolved={completeResolved}
            checked={selectedKeys.includes(item)}
            onToggle={toggleKey}
            noCheckBox={!!snapshotId}
            deviations={deviations}
          />
        ))
      )}

      <div
        className={clsx(
          'flex items-center pt-3 w-full',
          expanded && !snapshotId ? 'justify-between' : 'justify-end',
        )}
      >
        {expanded && !snapshotId && (
          <div className="flex gap-2 items-center">
            <GovButton
              type="outlined"
              color="primary"
              size="s"
              onClick={toggleAll}
              iconStart={
                <GovIcon name={allSelected ? 'x-square' : 'check-square'} />
              }
            >
              {allSelected ? t('DeselectAll') : t('SelectAll')}
            </GovButton>
            <span className="text-sm text-accent">
              {t('SelectedCount', {
                selected: selectedKeys.length,
                total: keys.length,
              })}
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <GovButton
            type="outlined"
            color="primary"
            size="s"
            onClick={() => setExpanded((prev) => !prev)}
            iconStart={
              <GovIcon
                name="chevron-compact-down"
                className={clsx(
                  expanded && 'rotate-180',
                  'transition-transform duration-300',
                )}
              />
            }
          >
            {expanded ? t('HideDifferences') : t('ShowDifferences')}
          </GovButton>

          {!snapshotId ? (
            <GovButton
              type="solid"
              color="primary"
              size="s"
              disabled={!selectedKeys.length || mutation.isPending}
              onClick={handleSubmitSelected}
              iconStart={<GovIcon name="check-circle" />}
            >
              {t('AcceptSelected')}
            </GovButton>
          ) : (
            <GovButton
              type="solid"
              color="primary"
              size="s"
              disabled={mutation.isPending}
              onClick={handleUpdateLocalCopy}
              iconStart={<GovIcon name="cloud-download" />}
            >
              {mutation.isPending ? t('Updating') : t('UpdateAndKeepLink')}
            </GovButton>
          )}
        </div>
      </div>
    </div>
  );
};
