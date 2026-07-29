'use client';

import { useGetOntologyDetail } from '@/api/generated';
import { PageLoader } from '../shared/PageLoader';

import { DictionaryEditForm } from './DictionaryEditForm';

export const DictionaryEditWrapper = ({ slug }: { slug: string }) => {
  const ontology = useGetOntologyDetail(encodeURIComponent(slug));
  const ontologyDetail = ontology.data?.data?.ontologyDetail;
  const ontologyMetadata = ontology.data?.data?.ontologyMetadata;
  if (ontology.isPending) {
    return <PageLoader />;
  }

  if (ontologyDetail && ontologyMetadata && ontologyMetadata.id)
    return (
      <DictionaryEditForm
        ontologySlug={slug}
        ontologyID={ontologyMetadata.id}
        metadata={ontologyMetadata}
        detail={ontologyDetail}
      />
    );
};
