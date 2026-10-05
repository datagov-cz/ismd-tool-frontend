import { useMemo } from 'react';

import { ApiResponseDtoGetOntologyDto } from '@/api/generated';
import { Concept } from '../model/concept';

export function useDiagramConcepts(data?: ApiResponseDtoGetOntologyDto) {
  return useMemo(() => {
    const ontologyDetail = data?.data?.ontologyDetail;
    const metadataConcepts = data?.data?.ontologyMetadata?.concepts;

    const ontologyName = ontologyDetail?.název?.cs;

    const pojmy = ontologyDetail?.pojmy;

    if (!pojmy) {
      return {
        ontologyName,
        concepts: [],
      };
    }

    const metaByIri = new Map(
      (metadataConcepts ?? []).map((c) => [c.conceptIri, c]),
    );

    const concepts = pojmy.map((concept) => {
      const iri = (concept as { iri?: string }).iri;
      const metadata = iri ? metaByIri.get(iri) : undefined;

      return metadata
        ? ({ ...concept, slug: metadata.slug, metadata } as Concept)
        : concept;
    });

    return {
      ontologyName,
      concepts,
    };
  }, [data]);
}
