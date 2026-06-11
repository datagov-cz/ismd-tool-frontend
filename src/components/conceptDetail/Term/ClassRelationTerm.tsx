import { GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import Link from 'next/link';

import {
  ConceptDetailModelReferencovanéPojmyResolved,
  ResolvedConceptDto,
} from '@/api/generated';

const conceptHref = (item: {
  source?: string;
  conceptSlug?: string;
  iri?: string;
}) =>
  item.source === 'ISMD'
    ? `/concept/${item.conceptSlug}`
    : `/concept/nkd?iri=${item.iri}`;

export const ClassRelationTerm = ({
  iri,
  resolved,
}: {
  iri: string;
  resolved?: ConceptDetailModelReferencovanéPojmyResolved;
}) => {
  const relation = resolved?.[iri];
  if (!relation) return;

  const href = conceptHref(relation);

  return (
    <div
      className={clsx(
        'border border-border-primary bg-primary-subtlest w-full flex flex-col rounded-md text-blue-button-active font-bold',
        relation.ontologyName ? 'px-2 py-1' : 'p-2',
      )}
    >
      <Link href={href} className="hover:underline cursor-pointer">
        <span className="flex gap-1.5">
          <GovIcon
            slot="icon-start"
            name="bezier2"
            type="components"
            size="l"
            color="primary"
            className="mt-1! shrink-0"
          />
          {relation.conceptName?.cs}
        </span>
      </Link>

      <div className="pl-5 flex flex-wrap gap-x-2 gap-y-1 items-center py-1">
        {relation.resolvedDomain && (
          <>
            <InnerTerm term={relation.resolvedDomain} /> &#8594;
          </>
        )}
        <Link
          href={href}
          className="inline-flex gap-1 px-1.5 py rounded-md border border-border-primary hover:underline"
        >
          {relation.conceptName?.cs}
        </Link>
        {relation.resolvedRange && (
          <>
            &#8594; <InnerTerm term={relation.resolvedRange} />
          </>
        )}
      </div>

      {relation.ontologyName?.cs && (
        <span className="flex gap-1.5 pl-6 font-normal text-dark-primary">
          <GovIcon
            slot="icon-start"
            name="journal-text"
            type="components"
            size="s"
            color="success"
            className="shrink-0 mt-1!"
          />
          {relation.ontologyName.cs}
        </span>
      )}
    </div>
  );
};

export const InnerTerm = ({ term }: { term: ResolvedConceptDto }) => (
  <Link
    href={conceptHref(term)}
    className="inline-flex gap-1 px-1.5 py bg-white rounded-md border border-border-grey hover:underline"
  >
    <GovIcon
      slot="icon-start"
      name="card-heading"
      type="components"
      size="l"
      color="primary"
      className="mt-0.5! shrink-0"
    />{' '}
    {term.conceptName?.cs}
  </Link>
);
