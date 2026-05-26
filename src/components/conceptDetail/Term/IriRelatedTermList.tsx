import { ConceptDetailModelReferencovanéPojmyResolved } from '@/api/generated';

import { IriRelatedTerm } from './IriRelatedTerm';

type Props = {
  iris: string[];
  resolved?: ConceptDetailModelReferencovanéPojmyResolved;
};

export const IriRelatedTermList = ({ iris, resolved }: Props) => {
  return (
    <>
      {iris.map((iri) => (
        <IriRelatedTerm key={iri} iri={iri} resolved={resolved} />
      ))}
    </>
  );
};
