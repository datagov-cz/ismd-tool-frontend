import { useState } from 'react';
import { GovButton, GovChip, GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import {
  ConceptDetailModelReferencovanéPojmyResolved,
  PublishedConceptDeviationModel,
  useUpdateLocalCopy,
} from '@/api/generated';

import { DeviationKey } from './deviation.types';
import { formatKey } from './deviation.utils';
import { DeviationItem } from './DeviationItem';

export const DeviationGroup = ({
  keys,
  deviations,
  resolved,
  conceptId,
  snapshotId,
}: {
  keys: DeviationKey[];
  deviations: PublishedConceptDeviationModel;
  resolved?: ConceptDetailModelReferencovanéPojmyResolved;
  conceptId: number;
  snapshotId: number;
}) => {
  const t = useTranslations('ConceptDeviations');
  const [expanded, setExpanded] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<DeviationKey[]>([]);

  const mutation = useUpdateLocalCopy();

  const allSelected = selectedKeys.length === keys.length;

  const toggleKey = (key: DeviationKey) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const toggleAll = () => {
    setSelectedKeys(allSelected ? [] : [...keys]);
  };

  /** Full update — keep the link to the published source and take everything */
  const handleUpdateLocalCopy = () => {
    mutation.mutate(
      { conceptId, snapshotId },
      {
        onSuccess: () => {
          // optionally: invalidate the concept detail query / close the panel
          setExpanded(false);
        },
        onError: (error) => {
          console.error('Failed to update local copy', error);
        },
      },
    );
  };

  /** Partial update — take only the selected deviations */
  const handleSubmitSelected = () => {
    if (!selectedKeys.length) return;

    // TODO: wire to the correct endpoint — payload below
    const payload = {
      conceptId,
      snapshotId,
      selectedKeys, // DeviationKey[]
    };
    console.log('submitting selected deviations', payload);

    // e.g. mutation.mutate({ conceptId, snapshotId, data: selectedKeys }, { onSuccess: ... })
  };

  return (
    <div className="p-2 border border-border-primary-subtle rounded-sm space-y-2 bg-white">
      <span className="text-sm font-bold mb-3 block">
        {t('DifferencesLabel')}{' '}
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
            resolved={resolved}
            checked={selectedKeys.includes(item)}
            onToggle={toggleKey}
          />
        ))
      )}

      <div
        className={clsx(
          'flex items-center pt-3 w-full',
          expanded ? 'justify-between' : 'justify-end',
        )}
      >
        {expanded && (
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

          {expanded ? (
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
