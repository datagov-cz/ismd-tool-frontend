'use client';

import { useTranslations } from 'next-intl';

import { useGetConceptDetail, useGetCurrentUser } from '@/api/generated';
import { ConceptDetailLink } from '@/components/conceptDetail/ConceptDetailLink';
import { ConceptHeader } from '@/components/conceptDetail/ConceptHeader';
import { ConceptLayout } from '@/components/conceptDetail/ConceptLayout';
import { Section } from '@/components/conceptDetail/Section';
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
        conceptType={conceptType}
      />

      <ConceptLayout
        conceptDetail={conceptDetail}
        ontology={ontology}
        definicniObor={definicniObor}
        conceptType={conceptType}
        pathname={pathname}
      >
        {conceptType !== 'TRIDA' && (
          <Section title={t('Sections.Range')}>
            {conceptDetail['obor-hodnot'] && (
              <ConceptDetailLink href={conceptDetail['obor-hodnot']} />
            )}
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
