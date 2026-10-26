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
      className="mt-15 w-90 max-w-[calc(100%-2rem)] overflow-hidden rounded-md border border-blue-primary dark:border-diagram-blue-border bg-white dark:bg-diagram-surface shadow-subtle top-10!"
    >
      <div className="flex items-center gap-2 border-b border-gray-border/50 dark:border-diagram-border bg-primary-subtlest dark:bg-diagram-surface-raised px-3 py-2">
        <GovIcon
          name="bezier"
          size="s"
          color="primary"
          className="dark:brightness-150"
        />
        <div className="min-w-0">
          <div className="break-words text-sm font-bold text-dark-blue-subtle dark:text-gray-100">
            {title}
          </div>
          <div className="text-xs text-card-description dark:text-gray-300">
            {t('Count', { count: relations.length })}
          </div>
        </div>
      </div>

      <div className="nodrag nopan max-h-64 overflow-y-auto p-2">
        {relations.map((item) => (
          <button
            type="button"
            key={item.id}
            className="grid w-full grid-cols-3 items-center gap-2 rounded px-2 py-1.5 text-xs text-dark-blue-subtle dark:text-gray-100 hover:bg-page-background dark:hover:bg-diagram-hover focus-visible:outline-2 focus-visible:outline-blue-primary"
            onClick={() => onRelationClick(item)}
          >
            <span
              className="break-words text-right font-medium"
              title={item.source}
            >
              {item.source}
            </span>
            <span
              className="w-full break-words rounded-xl bg-primary-subtlest dark:bg-diagram-blue-selected px-2 py-1 text-center font-bold text-blue-hover dark:text-blue-200"
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
