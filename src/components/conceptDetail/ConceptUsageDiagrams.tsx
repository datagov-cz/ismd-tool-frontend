import { useState } from 'react';
import {
  GovButton,
  GovIcon,
  GovTooltip,
  GovTooltipContent,
} from '@gov-design-system-ce/react';
import Link from 'next/link';

import { DiagramConceptPlacement, useGetConceptUsage } from '@/api/generated';

export const ConceptUsageDiagrams = ({
  conceptSlug,
  conceptName,
}: {
  conceptSlug: string;
  conceptName: string;
}) => {
  const [open, setOpen] = useState(false);
  const diagrams = useGetConceptUsage(conceptSlug);
  const placements = diagrams.data?.data?.placements;
  const conceptIri = diagrams.data?.data?.conceptIri;

  if (placements && placements?.length > 0)
    return (
      <div className="bg-white px-4 py-3 rounded-md shadow-subtle mt-6">
        <h4>
          <span className="font-bold">Výskyty v diagramech</span> [
          {placements.length}]
        </h4>
        <div className="py-2">
          {placements.slice(0, open ? placements.length : 3).map((item) => (
            <ConceptInDiagram
              key={item.diagramId}
              item={item}
              conceptName={conceptName}
              conceptIri={conceptIri}
            />
          ))}
        </div>
        {placements.length > 3 && (
          <GovButton
            size="s"
            expanded
            color="primary"
            type="base"
            onGovClick={() => setOpen((prev) => !prev)}
          >
            Zobrazit {open ? 'méně' : 'více'}{' '}
            <GovIcon name={open ? 'chevron-up' : 'chevron-down'} />
          </GovButton>
        )}
      </div>
    );
  return null;
};

export const ConceptInDiagram = ({
  item,
  conceptName,
  conceptIri,
}: {
  item: DiagramConceptPlacement;
  conceptName: string;
  conceptIri?: string;
}) => {
  const diagramHref = `/dictionary/${item.ontologySlug}/diagram/${item.diagramId}`;
  const conceptHref = conceptIri
    ? `${diagramHref}#concept=${encodeURIComponent(conceptIri)}`
    : diagramHref;
  return (
    <div className="border-t border-secondary/50 py-1.5 last:border-b">
      <div className="flex">
        <div className="flex gap-2">
          <GovIcon name="diagram-3" size="xl" className="text-purple" />
          <div>
            <span className="font-bold flex items-center gap-2">
              {item.diagramName}{' '}
              <GovTooltip position="top" className="border-0!">
                <GovTooltipContent className="z-1000!">
                  Diagram obsahuje změny k materializaci
                </GovTooltipContent>
                <GovIcon name="clock-history" size="s" color="warning" />
              </GovTooltip>
            </span>
            {item.kind === 'NODE' && (
              <>
                {item.broader &&
                  item.broader.length > 0 &&
                  item.broader.map((item) => (
                    <div key={item.iri} className="text-sm">
                      <span className="font-bold text-dark-secondary">
                        {item.conceptName?.cs}
                      </span>{' '}
                      <span className="pt-2">&rarr;</span>{' '}
                      <span className="font-bold">{conceptName}</span>
                    </div>
                  ))}
                {item.exactMatch &&
                  item.exactMatch.length > 0 &&
                  item.exactMatch.map((item) => (
                    <div key={item.iri} className="text-sm">
                      <span className="font-bold text-dark-secondary">
                        {item.conceptName?.cs}
                      </span>{' '}
                      = <span className="font-bold">{conceptName}</span>
                    </div>
                  ))}
              </>
            )}
            {item.kind === 'EDGE' && (
              <>
                {item.domain && item.range && (
                  <div className="text-sm">
                    <span className="font-bold text-dark-secondary">
                      {item.domain.conceptName?.cs}
                    </span>{' '}
                    <span className="pt-2">&rarr;</span>{' '}
                    <span className="font-bold">{conceptName}</span>
                    <span className="pt-2">&rarr;</span>{' '}
                    <span className="font-bold text-dark-secondary">
                      {item.range.conceptName?.cs}
                    </span>
                  </div>
                )}
              </>
            )}
            {item.kind === 'PROPERTY_ROW' && (
              <>
                {item.hostClass && (
                  <div className="text-sm">
                    <span className="font-bold text-dark-secondary">
                      {item.hostClass.conceptName?.cs}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="inline-block size-2 border-l border-b border-secondary rounded-bl-sm" />
                      <span className="font-bold">{conceptName}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <Link href={conceptHref} className="ml-auto self-center" scroll={false}>
          <GovIcon name="pencil-square" color="primary" />
        </Link>
      </div>
    </div>
  );
};
