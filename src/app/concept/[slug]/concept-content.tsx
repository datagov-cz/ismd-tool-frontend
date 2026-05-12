'use client';

import { useTranslations } from 'next-intl';

import { useGetConceptDetail, useGetCurrentUser } from '@/api/generated';
import { AddPropertyRelation } from '@/components/conceptDetail/AddPropertyRelation';
import { ConceptDetailLink } from '@/components/conceptDetail/ConceptDetailLink';
import { ConceptHeader } from '@/components/conceptDetail/ConceptHeader';
import { ConceptLayout } from '@/components/conceptDetail/ConceptLayout';
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
  const { data: user } = useGetCurrentUser();

  if (!concept.data) return null;

  const conceptDetail = concept.data.data?.conceptDetail;
  const conceptMetadata = concept.data.data?.conceptMetadata;
  if (!conceptDetail || !conceptMetadata) return null;

  const ontology = extractOntologyFromUrl(conceptMetadata.graphName || '');
  const pathname = new URL(conceptMetadata.graphName || '').pathname;
  const definicniObor = extractDefinicniObor(conceptDetail, pathname);
  const conceptType = conceptMetadata.conceptType as
    | 'TRIDA'
    | 'VLASTNOST'
    | 'VZTAH'
    | undefined;

  return (
    <>
      <ConceptHeader
        ontology={ontology}
        conceptDetail={conceptDetail}
        definicniObor={definicniObor}
        conceptId={conceptMetadata.id}
        isPublished={conceptMetadata.isPublished}
        commentsCount={conceptMetadata.comments?.length ?? 0}
        loggedIn={user?.success === true}
        owner={conceptMetadata.user?.userId === user?.data?.userId}
        source={'ISMD'}
        updatedAt={conceptMetadata.updatedAt}
      />

      <ConceptLayout
        conceptDetail={conceptDetail}
        ontology={ontology}
        definicniObor={definicniObor}
        conceptType={conceptType}
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
            {conceptDetail['nadřazená-třída'] &&
              conceptDetail['nadřazená-třída']?.length > 0 && (
                <Section title={t('Sections.SupersededClass')}>
                  <div className="pl-12">
                    <SuperClassList
                      items={conceptDetail['nadřazená-třída']}
                      pathname={pathname}
                    />
                  </div>
                </Section>
              )}
            {conceptDetail.conceptProperties &&
              conceptDetail.conceptProperties?.length > 0 && (
                <AddPropertyRelation
                  concepts={conceptDetail.conceptProperties || []}
                  conceptIRI={conceptDetail.iri || ''}
                  type="VLASTNOST"
                  title={t('Sections.Properties')}
                  ontologyIRI={conceptMetadata.graphName || ''}
                  conceptSlug={conceptMetadata.slug || ''}
                />
              )}
            {conceptDetail.conceptRelationships &&
              conceptDetail.conceptRelationships?.length > 0 && (
                <AddPropertyRelation
                  concepts={conceptDetail.conceptRelationships || []}
                  conceptIRI={conceptDetail.iri || ''}
                  type="VZTAH"
                  title={t('Sections.Relations')}
                  ontologyIRI={conceptMetadata.graphName || ''}
                  conceptSlug={conceptMetadata.slug || ''}
                />
              )}
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

      {user?.data?.userId && (
        <CommentSidebox
          conceptIRI={conceptDetail.iri}
          comments={conceptMetadata.comments}
          refetch={() => concept.refetch()}
          userId={user?.data?.userId}
        />
      )}
    </>
  );
};
