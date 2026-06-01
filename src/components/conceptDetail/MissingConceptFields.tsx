'use client';

import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';
import {
  ConceptType,
  getMissingConceptFieldGroups,
} from '@/utils/getMissingConceptFields';

interface Props {
  conceptDetail: ConceptDetailModel;
  conceptType: ConceptType;
}

export const MissingConceptFields = ({ conceptDetail, conceptType }: Props) => {
  const t = useTranslations('ConceptDetail');
  const missingGroups = getMissingConceptFieldGroups(
    conceptDetail,
    conceptType,
  );

  if (missingGroups.length === 0) return null;

  return (
    <div className="mt-2 pl-4">
      <div>
        <span className="font-bold text-blue-primary text-lg">
          {t('UdajeKDoplneni.Title')}
        </span>
        {missingGroups.map((group) => (
          <div
            key={group.groupLabelKey}
            className="pb-4 pt-2 grid grid-cols-7 border-b border-border-primary-subtle/20 last:border-0"
          >
            <span className="text-sm text-dark-secondary font-bold mb-1 col-span-2 pt-2.5">
              {t(group.groupLabelKey as Parameters<typeof t>[0])}
            </span>
            <div className="col-span-5">
              {group.fields.map((config) => (
                <GovButton
                  key={config.key}
                  className="block! py-2"
                  color="primary"
                  type="base"
                >
                  <GovIcon
                    size="xs"
                    slot="icon-start"
                    type="components"
                    name="plus"
                  />
                  <span className="text-sm font-bold">
                    {t(config.labelKey as Parameters<typeof t>[0])}
                  </span>
                </GovButton>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
