import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';
import { AddPropertyRelation } from '../AddPropertyRelation';

interface Props {
  properties?: ConceptDetailModel['conceptProperties'];
  relationships?: ConceptDetailModel['conceptRelationships'];
}

export const PropertiesRelationsSection = ({
  properties = [],
  relationships = [],
}: Props) => {
  const t = useTranslations('ConceptDetail');
  if (!properties.length && !relationships.length) return null;
  return (
    <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
      {properties.length > 0 && (
        <AddPropertyRelation
          title={t('Sections.Properties')}
          concepts={properties}
        />
      )}
      {relationships.length > 0 && (
        <AddPropertyRelation
          title={t('Sections.Relations')}
          concepts={relationships}
        />
      )}
    </div>
  );
};
