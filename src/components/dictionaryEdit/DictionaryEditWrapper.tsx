'use client';

import { useGetOntologyDetail } from '@/api/generated';
import { CircularLoader } from '../shared/CircularLoader';

import { DictionaryEditForm } from './DictionaryEditForm';

export const DictionaryEditWrapper = ({ slug }: { slug: string }) => {
  const ontology = useGetOntologyDetail(encodeURIComponent(slug));
  const ontologyDetail = ontology.data?.data?.ontologyDetail;
  const ontologyMetadata = ontology.data?.data?.ontologyMetadata;
  if (ontology.isLoading)
    return (
      <div className="h-full flex items-center justify-center w-full">
        <CircularLoader />
      </div>
    );
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
