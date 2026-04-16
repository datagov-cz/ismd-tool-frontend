import { GovTag } from '@gov-design-system-ce/react';
import Link from 'next/link';

import { ConceptDetailModel } from '@/api/generated';
import { GridContainer } from '../dictionaryDetail/GridContainer';

type Props = {
  ontology: string;
  conceptDetail: ConceptDetailModel;
  definicniObor?: {
    name: string;
    link: string;
  } | null;
};

export const ConceptHeader = ({
  ontology,
  conceptDetail,
  definicniObor,
}: Props) => {
  const capitalizeFirst = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);
  return (
    <GridContainer>
      <div className="space-y-2 col-span-4 col-start-2">
        <p>{capitalizeFirst(ontology)}</p>
        <h1 className="text-xl lg:text-3xl font-bold">
          {conceptDetail.název?.cs}
        </h1>

        <div className="flex flex-wrap gap-1">
          {conceptDetail.typ?.map((item: string) => (
            <GovTag key={item} color="primary" type="subtle" size="xs">
              {item}
            </GovTag>
          ))}
        </div>

        {definicniObor?.name && (
          <span className="text-sm">
            {conceptDetail.typ?.[1]} pojmu{' '}
            <Link
              className="text-blue-primary visited:text-blue-primary underline cursor-pointer"
              href={definicniObor.link}
            >
              {capitalizeFirst(definicniObor.name)}
            </Link>
          </span>
        )}
      </div>
    </GridContainer>
  );
};
