import { GovFormCheckbox } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import {
  ConceptDetailModelReferencovanéPojmyResolved,
  PublishedConceptDeviationModel,
} from '@/api/generated';
import { SectionTitle } from '@/components/shared/SectionTitle';

import {
  DeviationKey,
  DeviationValue as DeviationValueType,
} from './deviation.types';
import { formatKey } from './deviation.utils';
import { DeviationValue } from './DeviationValue';

export const DeviationItem = ({
  propertyKey,
  data,
  resolved,
  checked,
  onToggle,
  noCheckBox = false,
  deviations,
}: {
  propertyKey: DeviationKey;
  data: DeviationValueType | undefined;
  resolved?: ConceptDetailModelReferencovanéPojmyResolved;
  checked: boolean;
  noCheckBox: boolean;
  onToggle: (_key: DeviationKey) => void;
  deviations: PublishedConceptDeviationModel;
}) => {
  const t = useTranslations('ConceptDeviations');

  if (!data) return null;

  return (
    <div className="py-2 px-2.5 bg-primary-subtlest rounded-sm">
      <div className="flex items-center">
        {!noCheckBox && (
          <GovFormCheckbox
            id={propertyKey}
            checked={checked}
            onGovChange={() => onToggle(propertyKey)}
            size="s"
          />
        )}
        <span className="text-sm font-bold">{formatKey(propertyKey)}</span>
      </div>
      <div className="ml-8 grid grid-cols-2">
        <div className="pr-4 border-r border-border-light">
          <SectionTitle label={t('LocalVersion')} size="sm" />
          <div>
            <DeviationValue
              propertyKey={propertyKey}
              data={data}
              side="localValue"
              resolved={resolved}
              deviationResolved={deviations}
            />
          </div>
        </div>
        <div className="pl-4">
          <SectionTitle label={t('PublishedVersion')} size="sm" />
          <div>
            <DeviationValue
              propertyKey={propertyKey}
              data={data}
              side="publishedValue"
              resolved={resolved}
              deviationResolved={deviations}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
