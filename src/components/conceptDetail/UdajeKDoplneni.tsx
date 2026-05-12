'use client';

import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';
import { Section } from '@/components/conceptDetail/Section';
import {
  ConceptType,
  getMissingConceptFieldGroups,
} from '@/utils/getMissingConceptFields';

interface Props {
  conceptDetail: ConceptDetailModel;
  conceptType: ConceptType;
}

export const UdajeKDoplneni = ({ conceptDetail, conceptType }: Props) => {
  const t = useTranslations('ConceptDetail');
  const missingGroups = getMissingConceptFieldGroups(
    conceptDetail,
    conceptType,
  );

  if (missingGroups.length === 0) return null;

  return (
    <div className="mt-6">
      <Section title="Údaje k doplnění">
        {missingGroups.map((group) => (
          <div
            key={group.groupLabelKey}
            className="pb-4 pt-2 pl-8 first:pt-0 border-b border-border-primary-subtle/20 last:border-0"
          >
            <span className="text-sm text-dark-secondary font-bold mb-1">
              {t(group.groupLabelKey as Parameters<typeof t>[0])}
            </span>
            <div className="flex flex-wrap gap-x-5 px-4">
              {group.fields.map((config) => (
                <button
                  key={config.key}
                  className="flex gap-2 items-center py-2"
                >
                  <span className="text-sm font-bold">
                    {t(config.labelKey as Parameters<typeof t>[0])}
                  </span>
                  <GovIcon
                    size="xs"
                    slot="icon-end"
                    type="components"
                    name="plus"
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
};
