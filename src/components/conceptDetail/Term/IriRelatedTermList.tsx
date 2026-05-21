import { IriRelatedTerm } from './IriRelatedTerm';

type Props = {
  iris: string[];
  pathname: string;
  source: 'ISMD' | 'NKD';
};

export const IriRelatedTermList = ({ iris, pathname, source }: Props) => (
  <>
    {iris.map((iri) => (
      <IriRelatedTerm key={iri} iri={iri} pathname={pathname} source={source} />
    ))}
  </>
);
