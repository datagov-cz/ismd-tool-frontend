import { useEffect, useMemo, useRef, useState } from 'react';
import { GovButton, GovIcon, GovTag } from '@gov-design-system-ce/react';
import { Handle, type NodeProps, Position, useStore } from '@xyflow/react';
import clsx from 'clsx';
import Link from 'next/link';

import { getConceptId, KIND_LABEL } from '../model/concept';
import type {
  ConceptFlowEdge,
  ConceptFlowNode,
  ConceptNodeData,
} from '../model/diagram';

import { useDiagramDispatch } from './diagramDispatchContext';
import { usePendingChanges } from './pendingChangesContext';

export const ConceptNode = ({
  id,
  data,
  selected,
}: NodeProps<ConceptFlowNode>) => {
  const { concept, vlastnosti } = data;
  const pendingConceptIds = usePendingChanges();
  const conceptHasPendingChange = pendingConceptIds.has(getConceptId(concept));
  const [openDetail, setOpenDetail] = useState(false);

  return (
    <div
      id={concept.iri}
      className={clsx(
        'border rounded-md bg-white w-full min-w-50 max-w-50 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] group relative',
        selected
          ? 'border-blue-primary'
          : conceptHasPendingChange
            ? 'border-status-warning-600 ring-2 ring-status-warning-200'
            : 'border-border-grey',
      )}
    >
      <ConceptNodeDetail
        nodeId={id}
        data={data}
        open={openDetail}
        onClose={() => setOpenDetail(false)}
      />
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center gap-1.5 px-2.5 py-2 group-hover:bg-primary-subtlest justify-between rounded-t-md">
        <div className="flex flex-col gap-0.5">
          <span className="text-dark-blue-subtle font-medium text-sm leading-none">
            {concept.název?.cs ??
              (concept.metadata &&
                'label' in concept.metadata &&
                concept.metadata?.label)}
          </span>
          <span className="text-xs font-medium text-card-description leading-none">
            {KIND_LABEL.trida}
          </span>
        </div>
        <button
          onClick={(event) => {
            event.stopPropagation();
            data.onFocus?.();
            setOpenDetail(true);
          }}
        >
          <GovIcon name="three-dots-vertical" size="xs" color="primary" />
        </button>
      </div>

      {vlastnosti.length !== 0 && (
        <div className="flex flex-col gap-1.5 px-2.5 pb-2">
          <details className="flex flex-col open:gap-1.5 open:pt-2">
            <summary className="order-last [&::-webkit-details-marker]:hidden list-none cursor-pointer text-xs font-medium flex items-center justify-between border-t border-border-grey pt-2">
              <span>
                Vlastnosti{' '}
                <span className="px-1 py-0.5 rounded-xs bg-border-grey">
                  {vlastnosti.length}
                </span>
              </span>
              <GovIcon
                name="chevron-down"
                size="xs"
                className="[&_svg]:transition-transform! [[open]_&_svg]:rotate-180! [&_svg]:duration-300"
              />
            </summary>

            {vlastnosti.map((v, i) => (
              <div
                key={`${getConceptId(v)}-${i}`}
                className={clsx(
                  'flex items-center gap-0.5 relative pb-0.5 font-medium rounded-sm',
                  pendingConceptIds.has(getConceptId(v)) &&
                    'bg-status-warning-100 ring-1 ring-status-warning-200',
                )}
              >
                <span className="size-1.5 border-b border-l border-[#DDDDDD] rounded-bl-xs" />
                <span className="text-xs text-card-description leading-none">
                  {v.název?.cs}
                </span>
              </div>
            ))}
          </details>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const ConceptNodeDetail = ({
  nodeId,
  data,
  open,
  onClose,
}: {
  nodeId: string;
  data: ConceptNodeData;
  open: boolean;
  onClose: () => void;
}) => {
  const dispatch = useDiagramDispatch();
  const detailRef = useRef<HTMLDivElement>(null);
  const [showAllProperties, setShowAllProperties] = useState(false);
  const [showAllRelations, setShowAllRelations] = useState(false);
  const edges = useStore((state) => state.edges) as ConceptFlowEdge[];
  const nodes = useStore((state) => state.nodes) as ConceptFlowNode[];
  const vztahy = useMemo(
    () =>
      edges.flatMap((edge) => {
        const isHierarchy = edge.data?.kind === 'hierarchie';
        const isOutgoing = edge.source === nodeId;
        const isIncoming = edge.target === nodeId;

        if (!isOutgoing && !isIncoming) return [];

        const relatedNodeId = isOutgoing ? edge.target : edge.source;
        const relatedNode = nodes.find((node) => node.id === relatedNodeId);
        const relatedConcept = relatedNode?.data;
        const label = isHierarchy
          ? isOutgoing
            ? 'má podtyp'
            : 'je podtyp'
          : edge.data?.label;

        if (!label) return [];

        return [
          {
            id: edge.id,
            label,
            target: relatedConcept?.concept.název?.cs,
            direction: isOutgoing ? '→' : '←',
          },
        ];
      }),
    [edges, nodeId, nodes],
  );
  const visibleProperties = showAllProperties
    ? data.vlastnosti
    : data.vlastnosti.slice(0, 3);
  const visibleRelations = showAllRelations ? vztahy : vztahy.slice(0, 3);
  const hiddenPropertiesCount = data.vlastnosti.length - 3;
  const hiddenRelationsCount = vztahy.length - 3;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (detailRef.current?.contains(event.target as Node)) return;

      onClose();
      data.onBlur?.();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [data, onClose, open]);

  return (
    <div
      ref={detailRef}
      onClick={(event) => event.stopPropagation()}
      className={clsx(
        'nodrag nopan w-75 bg-white absolute -right-2 translate-x-full bottom-0 p-3 shadow-subtle border rounded-md border-border-grey z-50 divide-y divide-border-grey space-y-2',
        !open && 'hidden',
      )}
    >
      <div className="flex items-start justify-between pb-2">
        <div>
          <Link
            href={`/concept/${data.concept.slug}`}
            className="flex gap-1.5 items-center font-medium text-blue-hover hover:underline cursor-pointer text-sm"
          >
            <span>{data.concept.název?.cs}</span>
            <GovIcon name="box-arrow-up-right" size="xs" />
          </Link>
          <GovTag type="subtle" size="xs" color="primary" className="mt-1!">
            <span className="font-bold">
              {data.concept.typ?.includes('Vlastnost')
                ? 'Vlastnost'
                : data.concept.typ?.includes('Vztah')
                  ? 'Vztah'
                  : 'Třída'}
            </span>
          </GovTag>
        </div>

        <button onClick={() => onClose()} className="flex items-center">
          <GovIcon name="x-lg" />
        </button>
      </div>
      <div className="pb-2.5">
        <span className="font-medium text-xs">Vlastnosti</span>
        <div className="pl-5 space-y-1.5 pt-1.5">
          {visibleProperties.map((v, i) => (
            <div
              key={`${getConceptId(v)}-${i}`}
              className="flex items-center justify-between gap-0.5 relative font-medium"
            >
              <span className="flex min-w-0 items-center gap-0.5">
                <span className="size-1.5 shrink-0 border-b border-l border-[#DDDDDD] rounded-bl-xs" />
                <span className="truncate text-xs text-card-description leading-none">
                  {v.název?.cs}
                </span>
              </span>
              <button
                type="button"
                aria-label={`Odebrat vlastnost ${v.název?.cs ?? ''}`}
                className="flex shrink-0 items-center"
                onClick={() =>
                  dispatch({
                    type: 'removeVlastnost',
                    targetNodeId: nodeId,
                    vlastnostId: getConceptId(v),
                  })
                }
              >
                <GovIcon name="trash" color="error" size="xs" />
              </button>
            </div>
          ))}
          {!showAllProperties && hiddenPropertiesCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllProperties(true)}
              className="rounded-full bg-page-background px-2 py-1 text-xs text-card-description hover:bg-border-grey"
            >
              + {hiddenPropertiesCount} dalších
            </button>
          )}
        </div>
      </div>
      <div className="pb-2.5">
        <span className="font-medium text-xs">Vztahy</span>
        <div className="space-y-1.5 pt-1.5 pl-2">
          {visibleRelations.map((vztah) => (
            <div
              key={vztah.id}
              className="flex items-center gap-2 relative font-medium"
            >
              <GovIcon
                name="bezier"
                size="s"
                className="[&_svg]:text-[#67329E]!"
              />
              <span className="text-xs text-card-description leading-none">
                {vztah.label}
                {vztah.target && ` ${vztah.direction} ${vztah.target}`}
              </span>
            </div>
          ))}
          {!showAllRelations && hiddenRelationsCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllRelations(true)}
              className="rounded-full bg-page-background px-2 py-1 text-xs text-card-description hover:bg-border-grey"
            >
              + {hiddenRelationsCount} dalších
            </button>
          )}
        </div>
      </div>
      <div>
        <span className="font-medium text-xs">Akce</span>
        <div className="flex flex-col gap-1">
          <GovButton
            color="primary"
            type="outlined"
            size="xs"
            href={`${process.env.NEXT_PUBLIC_BASE_PATH}/concept/${data.concept.slug}/edit`}
          >
            <GovIcon name="pencil" color="primary" slot="icon-start" /> Upravit
            pojem
          </GovButton>
          <GovButton
            color="error"
            size="xs"
            type="outlined"
            onGovClick={() => {
              data.onRemove?.();
              dispatch({ type: 'removeNode', nodeId });
            }}
          >
            <GovIcon name="trash" /> Odebrat z diagramu
          </GovButton>
        </div>
      </div>
    </div>
  );
};
