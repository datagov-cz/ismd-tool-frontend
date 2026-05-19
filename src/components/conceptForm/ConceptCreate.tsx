'use client';

import { GovIcon, GovTag } from '@gov-design-system-ce/react';

import { useGetOntologyDetail } from '@/api/generated';

import { ConceptForm } from './ConceptForm';

export const ConceptCreateWrapper = ({ ontology }: { ontology: string }) => {
  const { data } = useGetOntologyDetail(ontology);
  return (
    <div className="w-full max-w-250 mx-auto flex flex-col gap-5 py-5">
      <h1>
        <span className="font-medium text-md">Nový pojem k: </span>

        <GovTag
          color="success"
          type="subtle"
          size="xs"
          className="w-fit border bg-white!"
        >
          <GovIcon name="journal-text" slot="icon-start" type="components" />
          <span className="font-bold text-blue-primary">
            {data?.data?.ontologyDetail?.název?.cs}
          </span>
        </GovTag>
      </h1>
      {data?.data?.ontologyMetadata?.graphName && (
        <ConceptForm
          ontology={ontology}
          ontologyGraphName={data?.data?.ontologyMetadata?.graphName}
        />
      )}
    </div>
  );
};
