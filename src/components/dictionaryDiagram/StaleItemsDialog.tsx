import { GovButton, GovDialog, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { getConceptId, getConceptIri, getConceptLabel } from './model/concept';
import type { ConceptFlowEdge, ConceptFlowNode } from './model/diagram';

export type StaleDiagramItem = {
  id: string;
  conceptIri?: string;
  label: string;
  type: 'Class' | 'Property' | 'Relationship';
};

export const getStaleDiagramItems = (
  nodes: ConceptFlowNode[],
  edges: ConceptFlowEdge[],
): StaleDiagramItem[] => [
  ...nodes.flatMap((node) => [
    ...(node.data.concept.stale
      ? [
          {
            id: getConceptId(node.data.concept),
            conceptIri: getConceptIri(node.data.concept),
            label:
              getConceptLabel(node.data.concept) ??
              getConceptId(node.data.concept),
            type: 'Class' as const,
          },
        ]
      : []),
    ...node.data.vlastnosti.flatMap((property) =>
      property.stale
        ? [
            {
              id: getConceptId(property),
              conceptIri: getConceptIri(property),
              label: getConceptLabel(property) ?? getConceptId(property),
              type: 'Property' as const,
            },
          ]
        : [],
    ),
  ]),
  ...edges.flatMap((edge) =>
    edge.data?.stale && edge.data.kind === 'obecny' && edge.data.vztahIri
      ? [
          {
            id: edge.data.vztahIri,
            conceptIri: edge.data.vztahIri,
            label: edge.data.label ?? edge.data.vztahIri,
            type: 'Relationship' as const,
          },
        ]
      : [],
  ),
];

export const StaleItemsDialog = ({
  items,
  open,
  pending,
  onClose,
  onKeep,
  onRemove,
}: {
  items: StaleDiagramItem[];
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onKeep: () => void;
  onRemove: () => void;
}) => {
  const t = useTranslations('DictionaryDiagram.StaleItems');

  return (
    <GovDialog
      open={open}
      labelTag="h2"
      onGovClose={onClose}
      className="fixed z-100 [&_dialog]:max-w-2xl!"
    >
      <span slot="title" className="flex items-center gap-3">
        <GovIcon name="exclamation-triangle" color="error" size="xl" />
        {t('Title')}
      </span>

      <div className="flex max-h-[55vh] flex-col gap-4 overflow-y-auto pr-1">
        <p>{t('Description')}</p>

        <ul className="divide-y divide-border-grey rounded-md border border-border-grey">
          {items.map((item) => (
            <li key={`${item.type}-${item.id}`} className="px-3 py-2">
              <span className="block text-xs font-medium text-card-description">
                {t(`Types.${item.type}`)}
              </span>
              <span className="font-medium text-status-error-700">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div slot="footer" className="flex flex-wrap justify-end gap-2">
        <GovButton
          type="outlined"
          color="primary"
          disabled={pending}
          onGovClick={onKeep}
        >
          {t('Keep')}
        </GovButton>
        <GovButton
          type="solid"
          color="primary"
          disabled={pending}
          onGovClick={onRemove}
        >
          {t('Remove')}
        </GovButton>
      </div>
    </GovDialog>
  );
};
