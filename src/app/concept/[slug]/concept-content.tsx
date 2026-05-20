'use client';

import { useGetConceptDetail, useGetCurrentUser } from '@/api/generated';
import { ConceptHeader } from '@/components/conceptDetail/ConceptHeader';
import { ConceptLayout } from '@/components/conceptDetail/ConceptLayout';
import { CommentSidebox } from '@/components/dictionaryDetail/CommentSidebox';
import { extractOntologyFromUrl } from '@/utils/conceptDetailUtils';

interface Props {
  slug: string;
}

export const ConceptContent = ({ slug }: Props) => {
  const concept = useGetConceptDetail(slug);
  const { data: user } = useGetCurrentUser();

  if (!concept.data) return null;

  const conceptDetail = concept.data.data?.conceptDetail;
  const conceptMetadata = concept.data.data?.conceptMetadata;
  if (!conceptDetail || !conceptMetadata) return null;

  const ontology = extractOntologyFromUrl(conceptMetadata.graphName || '');
  const pathname = new URL(conceptMetadata.graphName || '').pathname;
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
        conceptType={conceptType}
        pathname={pathname}
      />

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
