import { useState } from 'react';
import { GovButton, GovIcon, GovTag } from '@gov-design-system-ce/react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import clsx from 'clsx';
import Link from 'next/link';

import { getConceptId, KIND_LABEL } from '../model/concept';
import type { ConceptFlowNode, ConceptNodeData } from '../model/diagram';

export const ConceptNode = ({ data, selected }: NodeProps<ConceptFlowNode>) => {
  const { concept, vlastnosti } = data;
  const [openDetail, setOpenDetail] = useState(false);

  return (
    <div
      id={concept.iri}
      className={clsx(
        'border rounded-md bg-white w-full min-w-50 max-w-50 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] group relative',
        selected ? 'border-blue-primary' : 'border-border-grey',
      )}
    >
      <ConceptNodeDetail
        data={data}
        open={openDetail}
        onClose={() => setOpenDetail(false)}
      />
      <Handle id={concept.iri} type="target" position={Position.Top} />

      <div className="flex items-center gap-1.5 px-2.5 py-2 group-hover:bg-primary-subtlest justify-between rounded-t-md">
        <div className="flex flex-col gap-0.5">
          <span className="text-dark-blue-subtle font-medium text-sm leading-none">
            {concept.název?.cs}
          </span>
          <span className="text-xs font-medium text-card-description leading-none">
            {KIND_LABEL.trida}
          </span>
        </div>
        <button onClick={() => setOpenDetail(true)}>
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
                className="flex items-center gap-0.5 relative pb-0.5 font-medium"
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

      <Handle id={concept.iri} type="source" position={Position.Bottom} />
    </div>
  );
};

const ConceptNodeDetail = ({
  data,
  open,
  onClose,
}: {
  data: ConceptNodeData;
  open: boolean;
  onClose: () => void;
}) => {
  // const meta = data.concept.metadata;

  return (
    <div
      className={clsx(
        'w-75 bg-white absolute -right-2 translate-x-full bottom-0 p-3 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] border rounded-md border-border-grey z-20 divide-y divide-border-grey space-y-2',
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
          {data.vlastnosti.map((v, i) => (
            <div
              key={`${getConceptId(v)}-${i}`}
              className="flex items-center gap-0.5 relative font-medium"
            >
              <span className="size-1.5 border-b border-l border-[#DDDDDD] rounded-bl-xs" />
              <span className="text-xs text-card-description leading-none">
                {v.název?.cs}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <span className="font-medium text-xs">Vazby</span>
        <div className="pl-5 space-y-1.5 pt-1.5"></div>
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
          <GovButton color="error" size="xs" type="outlined">
            <GovIcon name="trash" /> Odebrat z diagramu
          </GovButton>
        </div>
      </div>
    </div>
  );
};
