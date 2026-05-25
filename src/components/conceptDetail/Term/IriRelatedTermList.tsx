import { ResolvedConceptsMap } from '@/utils/conceptRelations';

import { IriRelatedTerm } from './IriRelatedTerm';

type Props = {
  iris: string[];
  source: 'ISMD' | 'NKD';
  resolved: ResolvedConceptsMap;
};

export const IriRelatedTermList = ({ iris, source, resolved }: Props) => {
  console.log(resolved, iris, 'test');
  return (
    <>
      {iris.map((iri) => (
        <IriRelatedTerm
          key={iri}
          iri={iri}
          source={source}
          resolved={resolved}
        />
      ))}
    </>
  );
};
