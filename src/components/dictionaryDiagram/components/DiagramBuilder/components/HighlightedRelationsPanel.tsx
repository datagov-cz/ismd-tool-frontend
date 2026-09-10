import { GovIcon } from '@gov-design-system-ce/react';
import { Panel } from '@xyflow/react';
import { useTranslations } from 'next-intl';

export type HighlightedRelation = {
  id: string;
  sourceId: string;
  source: string;
  relation: string;
  targetId: string;
  target: string;
};

type HighlightedRelationsPanelProps = {
  title: string;
  relations: HighlightedRelation[];
  onRelationClick: (_relation: HighlightedRelation) => void;
};

export const HighlightedRelationsPanel = ({
  title,
  relations,
  onRelationClick,
}: HighlightedRelationsPanelProps) => {
  const t = useTranslations('DictionaryDiagram.HighlightedRelations');
  if (relations.length === 0) return null;

  return (
    <Panel
      position="top-left"
      className="mt-15 w-90 max-w-[calc(100%-2rem)] overflow-hidden rounded-md border border-blue-primary bg-white shadow-subtle top-10!"
    >
      <div className="flex items-center gap-2 border-b border-border-grey bg-primary-subtlest px-3 py-2">
        <GovIcon name="bezier" size="s" color="primary" />
        <div className="min-w-0">
          <div className="break-words text-sm font-bold text-dark-blue-subtle">
            {title}
          </div>
          <div className="text-xs text-card-description">
            {t('Count', { count: relations.length })}
          </div>
        </div>
      </div>

      <div className="nodrag nopan max-h-64 overflow-y-auto p-2">
        {relations.map((item) => (
          <button
            type="button"
            key={item.id}
            className="grid w-full grid-cols-3 items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-page-background focus-visible:outline-2 focus-visible:outline-blue-primary"
            onClick={() => onRelationClick(item)}
          >
            <span
              className="break-words text-right font-medium"
              title={item.source}
            >
              {item.source}
            </span>
            <span
              className="w-full break-words rounded-xl bg-primary-subtlest px-2 py-1 text-center font-bold text-blue-hover"
              title={item.relation}
            >
              → {item.relation} →
            </span>
            <span className="break-words font-medium" title={item.target}>
              {item.target}
            </span>
          </button>
        ))}
      </div>
    </Panel>
  );
};
