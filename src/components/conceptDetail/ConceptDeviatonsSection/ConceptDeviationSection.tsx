import { useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import {
  ConceptDetailModelReferencovanéPojmyResolved,
  LinkSnapshotDto,
  PublishedConceptDeviationModel,
} from '@/api/generated';

import { isDeviationKey } from './deviation.types';
import { formatKey } from './deviation.utils';
import { DeviationGroup } from './DeviationGroup';

export const ConceptDeviationSection = ({
  deviations,
  resolved,
  conceptId,
  linkSnapshots,
}: {
  deviations?: PublishedConceptDeviationModel;
  resolved?: ConceptDetailModelReferencovanéPojmyResolved;
  conceptId: number;
  linkSnapshots?: LinkSnapshotDto[];
}) => {
  const t = useTranslations('ConceptDeviations');
  const [open, setOpen] = useState(false);

  const keysDeviations = deviations
    ? Object.keys(deviations).filter(isDeviationKey)
    : [];

  const snapshotDeviations = (linkSnapshots ?? [])
    .map((snapshot) => ({
      snapshot,
      keys: snapshot.deviation
        ? Object.keys(snapshot.deviation).filter(isDeviationKey)
        : [],
    }))
    .filter(({ keys }) => keys.length > 0);

  const numberOfDeviations =
    keysDeviations.length +
    snapshotDeviations.reduce((sum, { keys }) => sum + keys.length, 0);

  if (numberOfDeviations === 0) return null;

  return (
    <div className="bg-status-warning-100 px-4 py-3 rounded-lg shadow-subtle mt-4 border border-status-warning-600">
      <div
        className={clsx(
          'flex flex-row justify-between items-center w-full pb-2.5',
          !open && 'border-b border-gray-border',
        )}
      >
        <div>
          <span className="font-bold">
            {t('Title', { count: numberOfDeviations })}
          </span>
          <p className="text-sm">{t('Description')}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label={open ? t('CollapseAria') : t('ExpandAria')}
        >
          <GovIcon
            name="chevron-compact-down"
            size="xl"
            className={clsx(
              open && 'rotate-180',
              'transition-transform duration-300',
            )}
          />
        </button>
      </div>

      <div className="flex flex-col">
        {!open ? (
          <div>
            {keysDeviations.length > 0 && (
              <div>
                <span className="text-sm font-bold">
                  {t('DifferencesLabel')}{' '}
                </span>
                <span className="text-sm">
                  {keysDeviations.map(formatKey).join(', ')}
                </span>
              </div>
            )}
            {snapshotDeviations.length > 0 && (
              <div>
                <span className="text-sm font-bold">
                  {t('DifferencesLabelConcept')}{' '}
                </span>
                <span className="text-sm font-bold text-blue-hover">
                  {snapshotDeviations
                    .map(({ snapshot }) => snapshot.nkdConcept?.label)
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {keysDeviations.length > 0 && deviations && (
              <DeviationGroup
                keys={keysDeviations}
                deviations={deviations}
                resolved={resolved}
                conceptId={conceptId}
              />
            )}
            {snapshotDeviations.map(
              ({ snapshot, keys }) =>
                snapshot.deviation && (
                  <DeviationGroup
                    key={snapshot.snapshotId}
                    keys={keys}
                    deviations={snapshot.deviation}
                    resolved={resolved}
                    conceptId={conceptId}
                    snapshotId={snapshot.snapshotId}
                    conceptLabel={snapshot.nkdConcept?.label}
                  />
                ),
            )}
          </div>
        )}
      </div>
    </div>
  );
};
