'use client';

import { useGetConceptDetail, useGetCurrentUser } from '@/api/generated';
import { ConceptHeader } from '@/components/conceptDetail/ConceptHeader';
import { ConceptLayout } from '@/components/conceptDetail/ConceptLayout';
import { OtherOntologyConcepts } from '@/components/conceptDetail/OtherOntologyConcepts';
import { CommentSidebox } from '@/components/dictionaryDetail/CommentSidebox';
import { CircularLoader } from '@/components/shared/CircularLoader';
import { extractOntologyFromUrl } from '@/utils/conceptDetailUtils';

interface Props {
  slug: string;
}

export const ConceptContent = ({ slug }: Props) => {
  const concept = useGetConceptDetail(slug);
  const { data: user } = useGetCurrentUser();

  if (concept.isLoading)
    return (
      <div className="h-full flex items-center justify-center w-full">
        <CircularLoader />
      </div>
    );
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
        conceptType={conceptType}
      />

      <ConceptLayout
        conceptDetail={conceptDetail}
        conceptType={conceptType}
        pathname={pathname}
        source="ISMD"
      >
        <OtherOntologyConcepts
          ontology={conceptMetadata.graphName || ''}
          source="ISMD"
        />
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
