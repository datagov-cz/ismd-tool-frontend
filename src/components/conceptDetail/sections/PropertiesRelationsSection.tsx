import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';
import { AddPropertyRelation } from '../AddPropertyRelation/AddPropertyRelation';
import { AddPropertyRelationModal } from '../AddPropertyRelation/AddPropertyRelationModal';

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
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'property' | 'relation'>(
    'property',
  );
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
        isOwnerLoggedIn={isOwnerLoggedIn}
        openModal={() => {
          setSelectedType('property');
          setOpen(true);
        }}
      />
      <AddPropertyRelation
        title={t('Sections.Relations')}
        concepts={relationships}
        type="relation"
        isOwnerLoggedIn={isOwnerLoggedIn}
        openModal={() => {
          setSelectedType('relation');
          setOpen(true);
        }}
      />
      {conceptName && isOwnerLoggedIn && (
        <AddPropertyRelationModal
          iri={iri}
          type={selectedType}
          conceptName={conceptName}
          open={open}
          setOpen={setOpen}
          slug={slug}
        />
      )}
    </div>
  );
};
