import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';
import { AddPropertyRelation } from '../AddPropertyRelation/AddPropertyRelation';

interface Props {
  properties?: ConceptDetailModel['conceptProperties'];
  relationships?: ConceptDetailModel['conceptRelationships'];
  iri: string;
  conceptName?: string;
  slug: string;
  isOwnerLoggedIn?: boolean;
}

export const PropertiesRelationsSection = ({
  properties = [],
  relationships = [],
  iri,
  conceptName,
  slug,
  isOwnerLoggedIn,
}: Props) => {
  const t = useTranslations('ConceptDetail');
  if (
    properties.length === 0 &&
    relationships.length === 0 &&
    !isOwnerLoggedIn
  ) {
    return null;
  }
  return (
    <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
      <AddPropertyRelation
        title={t('Sections.Properties')}
        concepts={properties}
        type="property"
        iri={iri}
        conceptName={conceptName}
        slug={slug}
        isOwnerLoggedIn={isOwnerLoggedIn}
      />
      <AddPropertyRelation
        title={t('Sections.Relations')}
        concepts={relationships}
        type="relation"
        iri={iri}
        conceptName={conceptName}
        slug={slug}
        isOwnerLoggedIn={isOwnerLoggedIn}
      />
    </div>
  );
};
