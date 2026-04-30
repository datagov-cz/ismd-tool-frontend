'use client';

import { useTranslations } from 'next-intl';

import { useGetConceptDetail } from '@/api/generated';
import { conceptDataFormatter } from '@/components/conceptCreate/conceptDataFormatter';
import { CreateConceptSideBox } from '@/components/conceptCreate/CreateConceptSidebox';
import { AddPropertyRelation } from '@/components/conceptDetail/AddPropertyRelation';
import { ConceptDetailLink } from '@/components/conceptDetail/ConceptDetailLink';
import { ConceptLayout } from '@/components/conceptDetail/ConceptLayout';
import { ControlPanelConcept } from '@/components/conceptDetail/ControlPanelConcept';
import { Section } from '@/components/conceptDetail/Section';
import { SuperClassList } from '@/components/conceptDetail/SuperClassList';
import { CommentSidebox } from '@/components/dictionaryDetail/CommentSidebox';
import {
  extractDefinicniObor,
  extractOntologyFromUrl,
} from '@/utils/conceptDetailUtils';

interface Props {
  slug: string;
}

export const ConceptContent = ({ slug }: Props) => {
  const t = useTranslations('ConceptDetail');
  const concept = useGetConceptDetail(slug);

  if (!concept.data) return null;

  const conceptDetail = concept.data.data?.conceptDetail;
  const conceptMetadata = concept.data.data?.conceptMetadata;
  if (!conceptDetail || !conceptMetadata) return null;

  const ontology = extractOntologyFromUrl(conceptMetadata.graphName || '');
  const pathname = new URL(conceptMetadata.graphName || '').pathname;
  const definicniObor = extractDefinicniObor(conceptDetail, pathname);
  const conceptType = conceptMetadata.conceptType;

  return (
    <>
      <ConceptLayout
        conceptDetail={conceptDetail}
        ontology={ontology}
        definicniObor={definicniObor}
      >
        {conceptType !== 'TRIDA' && (
          <Section title={t('Sections.Range')}>
            {conceptDetail['obor-hodnot'] && (
              <ConceptDetailLink href={conceptDetail['obor-hodnot']} />
            )}
          </Section>
        )}

        {conceptType === 'TRIDA' && (
          <>
            <Section title={t('Sections.SupersededClass')}>
              <SuperClassList
                items={conceptDetail['nadřazená-třída']}
                pathname={pathname}
              />
            </Section>
            <AddPropertyRelation
              concepts={conceptDetail.conceptProperties || []}
              conceptIRI={conceptDetail.iri || ''}
              type="VLASTNOST"
              title={t('Sections.Properties')}
              ontologyIRI={conceptMetadata.graphName || ''}
              conceptSlug={conceptMetadata.slug || ''}
            />
            <AddPropertyRelation
              concepts={conceptDetail.conceptRelationships || []}
              conceptIRI={conceptDetail.iri || ''}
              type="VZTAH"
              title={t('Sections.Relations')}
              ontologyIRI={conceptMetadata.graphName || ''}
              conceptSlug={conceptMetadata.slug || ''}
            />
          </>
        )}

        {conceptType === 'VLASTNOST' && (
          <Section title={t('Sections.SupersededProperty')}>
            <SuperClassList
              items={conceptDetail['nadřazená-vlastnost']}
              pathname={pathname}
            />
          </Section>
        )}

        {conceptType === 'VZTAH' && (
          <Section title={t('Sections.SupersededRelation')}>
            <SuperClassList
              items={conceptDetail['nadřazený-vztah']}
              pathname={pathname}
            />
          </Section>
        )}
      </ConceptLayout>

      <ControlPanelConcept
        conceptID={conceptMetadata.id || 0}
        isPublished={conceptMetadata.isPublished || false}
        name={conceptDetail.název?.cs || ''}
      />
      <CommentSidebox
        conceptIRI={conceptDetail.iri}
        comments={conceptMetadata.comments}
        refetch={() => concept.refetch()}
        userId="test"
      />
      {conceptMetadata.graphName && concept.data.data && (
        <CreateConceptSideBox
          slug={conceptMetadata.slug || ''}
          namespace={conceptMetadata.graphName}
          defaultData={conceptDataFormatter(concept.data.data)}
          action="update"
          conceptId={conceptMetadata.id}
          sideboxId="update"
        />
      )}
    </>
  );
};
