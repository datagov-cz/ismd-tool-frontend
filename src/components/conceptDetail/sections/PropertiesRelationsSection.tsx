import { useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  ConceptDetailModel,
  ConceptDetailModelReferencovanéPojmyResolved,
} from '@/api/generated';
import { AddPropertyModal } from '../AddPropertyRelation/AddPropertyModal';
import { AddPropertyRelation } from '../AddPropertyRelation/AddPropertyRelation';
import { AddRelation } from '../AddPropertyRelation/AddRelation';
import { AddRelationModal } from '../AddPropertyRelation/AddRelationModal';

interface Props {
  properties?: ConceptDetailModel['conceptProperties'];
  relationships?: ConceptDetailModel['conceptRelationships'];
  iri: string;
  conceptName?: string;
  slug: string;
  isOwnerLoggedIn?: boolean;
  resolvedRelations?: ConceptDetailModelReferencovanéPojmyResolved;
}

export const PropertiesRelationsSection = ({
  properties = [],
  relationships = [],
  iri,
  conceptName,
  slug,
  isOwnerLoggedIn,
  resolvedRelations,
}: Props) => {
  const t = useTranslations('ConceptDetail');
  const [propertyOpen, setPropertyOpen] = useState(false);
  const [relationOpen, setRelationOpen] = useState(false);

  if (
    properties.length === 0 &&
    relationships.length === 0 &&
    !isOwnerLoggedIn
  ) {
    return null;
  }

  return (
    <>
      <div className="bg-white px-4 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
        <AddPropertyRelation
          title={t('Sections.Properties')}
          concepts={properties}
          type="property"
          isOwnerLoggedIn={isOwnerLoggedIn}
          openModal={() => setPropertyOpen(true)}
          resolvedRelations={resolvedRelations}
        />
        <AddRelation
          title={t('Sections.Relations')}
          concepts={relationships}
          type="relation"
          isOwnerLoggedIn={isOwnerLoggedIn}
          openModal={() => setRelationOpen(true)}
          resolvedRelations={resolvedRelations}
        />
      </div>
      {conceptName && isOwnerLoggedIn && (
        <>
          <AddPropertyModal
            iri={iri}
            conceptName={conceptName}
            open={propertyOpen}
            setOpen={setPropertyOpen}
            slug={slug}
          />
          <AddRelationModal
            iri={iri}
            conceptName={conceptName}
            open={relationOpen}
            setOpen={setRelationOpen}
            slug={slug}
          />
        </>
      )}
    </>
  );
};
