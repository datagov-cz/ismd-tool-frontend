import { GovFormCheckbox } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { ConceptDetailModelReferencovanéPojmyResolved } from '@/api/generated';

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
}: {
  propertyKey: DeviationKey;
  data: DeviationValueType | undefined;
  resolved?: ConceptDetailModelReferencovanéPojmyResolved;
  checked: boolean;
  onToggle: (_key: DeviationKey) => void;
}) => {
  const t = useTranslations('ConceptDeviations');

  if (!data) return null;

  return (
    <div className="py-2 px-2.5 bg-primary-subtlest rounded-sm">
      <div className="flex items-center">
        <GovFormCheckbox
          id={propertyKey}
          checked={checked}
          onGovChange={() => onToggle(propertyKey)}
          size="s"
        />
        <span className="text-sm font-bold">{formatKey(propertyKey)}</span>
      </div>
      <div className="ml-8 grid grid-cols-2">
        <div className="pr-4 border-r border-border-light">
          <span className="font-bold text-blue-primary text-sm">
            {t('LocalVersion')}
          </span>
          <div>
            <DeviationValue
              propertyKey={propertyKey}
              data={data}
              side="localValue"
              resolved={resolved}
            />
          </div>
        </div>
        <div className="pl-4">
          <span className="font-bold text-blue-primary text-sm">
            {t('PublishedVersion')}
          </span>
          <div>
            <DeviationValue
              propertyKey={propertyKey}
              data={data}
              side="publishedValue"
              resolved={resolved}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
