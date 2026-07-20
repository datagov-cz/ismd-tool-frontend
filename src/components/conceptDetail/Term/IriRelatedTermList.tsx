import {
  ConceptDetailModelReferencovanéPojmyResolved,
  ConceptMetadataModelConceptType,
} from '@/api/generated';

import { IriRelatedTerm } from './IriRelatedTerm';

type Props = {
  iris: string[];
  resolved?: ConceptDetailModelReferencovanéPojmyResolved;
  type?: ConceptMetadataModelConceptType;
};

export const IriRelatedTermList = ({ iris, resolved, type }: Props) => {
  return (
    <>
      {iris.map((iri) => (
        <IriRelatedTerm key={iri} iri={iri} resolved={resolved} type={type} />
      ))}
    </>
  );
};
