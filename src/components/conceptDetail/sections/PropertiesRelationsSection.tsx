import { useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  ConceptDetailModel,
  ConceptDetailModelReferencovanéPojmyResolved,
} from '@/api/generated';
import { AddPropertyModal } from '../AddPropertyRelation/AddPropertyModal';
import { AddPropertyRelation } from '../AddPropertyRelation/AddPropertyRelation';
import { AddRelationModal } from '../AddPropertyRelation/AddRelationModal';

import { CodeListSection } from './CodeListSection';

interface Props {
  properties?: ConceptDetailModel['conceptProperties'];
  relationships?: ConceptDetailModel['conceptRelationships'];
  classIri: string;
  conceptName?: string;
  classSlug: string;
  isOwnerLoggedIn?: boolean;
  resolvedRelations?: ConceptDetailModelReferencovanéPojmyResolved;
  ontologyIri?: string;
  ontologySlug?: string;
  codeList?: ConceptDetailModel['instance-definovány-číselníkem'];
  codeListResolved?: ConceptDetailModel['instance-definovány-číselníkem-resolved'];
}

export const PropertiesRelationsSection = ({
  properties = [],
  relationships = [],
  classIri,
  conceptName,
  classSlug,
  isOwnerLoggedIn,
  ontologyIri,
  ontologySlug,
  resolvedRelations,
  codeList,
  codeListResolved,
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
      <div className="bg-surface px-4 py-3 rounded-md shadow-subtle">
        <AddPropertyRelation
          title={t('Sections.Properties')}
          concepts={properties}
          type="property"
          isOwnerLoggedIn={isOwnerLoggedIn}
          openModal={() => setPropertyOpen(true)}
          resolvedRelations={resolvedRelations}
        />
        <AddPropertyRelation
          title={t('Sections.Relations')}
          concepts={relationships}
          type="relation"
          isOwnerLoggedIn={isOwnerLoggedIn}
          openModal={() => setRelationOpen(true)}
          resolvedRelations={resolvedRelations}
        />
        <CodeListSection codeList={codeList} resolved={codeListResolved} />
      </div>
      {conceptName && isOwnerLoggedIn && (
        <>
          <AddPropertyModal
            classIri={classIri}
            conceptClassName={conceptName}
            open={propertyOpen}
            setOpen={setPropertyOpen}
            classSlug={classSlug}
            ontologyGraphName={ontologyIri}
            ontologySlug={ontologySlug}
          />
          <AddRelationModal
            classIri={classIri}
            conceptClassName={conceptName}
            open={relationOpen}
            setOpen={setRelationOpen}
            classSlug={classSlug}
            ontologyGraphName={ontologyIri}
            ontologySlug={ontologySlug}
          />
        </>
      )}
    </>
  );
};
