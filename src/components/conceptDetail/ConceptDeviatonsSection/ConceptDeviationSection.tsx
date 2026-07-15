import { useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import {
  ConceptDetailModelReferencovanéPojmyResolved,
  PublishedConceptDeviationModel,
} from '@/api/generated';

import { isDeviationKey } from './deviation.types';
import { formatKey } from './deviation.utils';
import { DeviationGroup } from './DeviationGroup';

export const ConceptDeviationSection = ({
  deviations,
  resolved,
  conceptId,
  snapshotId,
}: {
  deviations: PublishedConceptDeviationModel;
  resolved?: ConceptDetailModelReferencovanéPojmyResolved;
  conceptId: number;
  snapshotId: number;
}) => {
  const t = useTranslations('ConceptDeviations');
  const [open, setOpen] = useState(false);
  const keys = Object.keys(deviations).filter(isDeviationKey);

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
            {t('Title', { count: keys.length })}
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
            <span className="text-sm font-bold">{t('DifferencesLabel')} </span>
            <span className="text-sm">{keys.map(formatKey).join(', ')}</span>
          </div>
        ) : (
          <DeviationGroup
            keys={keys}
            deviations={deviations}
            resolved={resolved}
            conceptId={conceptId}
            snapshotId={snapshotId}
          />
        )}
      </div>
    </div>
  );
};
