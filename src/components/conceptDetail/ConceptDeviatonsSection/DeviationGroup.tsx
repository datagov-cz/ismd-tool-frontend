import { useState } from 'react';
import { GovButton, GovChip, GovIcon } from '@gov-design-system-ce/react';
import axios from 'axios';
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
          const message = axios.isAxiosError(error)
            ? (error.response?.data?.message ?? error.message)
            : 'Something went wrong';

          toast(message, { position: 'bottom-right', type: 'error' });
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
          const message = axios.isAxiosError(error)
            ? (error.response?.data?.message ?? error.message)
            : 'Something went wrong';

          toast(message, { position: 'bottom-right', type: 'error' });
        },
      },
    );
  };

  const completeResolved = {
    ...resolved,
    ...deviations['referencované-pojmy-resolved'],
  };

  return (
    <div className="p-2 border border-border-primary-subtle rounded-sm space-y-2 bg-white">
      <span className="text-sm font-bold mb-3 block">
        {t(snapshotId ? 'DifferencesLabelConcept' : 'DifferencesLabel')}{' '}
        {conceptLabel && (
          <span className="text-blue-hover font-bold">{conceptLabel}</span>
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
              onGovClick={toggleAll}
            >
              <GovIcon
                slot="icon-start"
                name={allSelected ? 'x-square' : 'check-square'}
              />
              {allSelected ? t('DeselectAll') : t('SelectAll')}
            </GovButton>
            <span className="text-sm text-blue-hover">
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
            onGovClick={() => setExpanded((prev) => !prev)}
          >
            <GovIcon
              slot="icon-start"
              name="chevron-compact-down"
              className={clsx(
                expanded && 'rotate-180',
                'transition-transform duration-300',
              )}
            />
            {expanded ? t('HideDifferences') : t('ShowDifferences')}
          </GovButton>

          {!snapshotId ? (
            <GovButton
              type="solid"
              color="primary"
              size="s"
              disabled={!selectedKeys.length || mutation.isPending}
              onGovClick={handleSubmitSelected}
            >
              <GovIcon slot="icon-start" name="check-circle" />
              {t('AcceptSelected')}
            </GovButton>
          ) : (
            <GovButton
              type="solid"
              color="primary"
              size="s"
              disabled={mutation.isPending}
              onGovClick={handleUpdateLocalCopy}
            >
              <GovIcon slot="icon-start" name="cloud-download" />
              {mutation.isPending ? t('Updating') : t('UpdateAndKeepLink')}
            </GovButton>
          )}
        </div>
      </div>
    </div>
  );
};
