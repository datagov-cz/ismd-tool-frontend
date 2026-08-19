import { useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { Panel } from '@xyflow/react';

import { ToolbarButton } from './ToolbarButton';

type DiagramTopBarProps = {
  onExport?: () => void;
  onRename?: () => void;
  onHelp?: () => void;
};

export const DiagramTopBar = ({
  onExport,
  onRename,
  onHelp,
}: DiagramTopBarProps) => {
  const [showEdgeHelp, setShowEdgeHelp] = useState(false);

  const toggleEdgeHelp = () => {
    setShowEdgeHelp((visible) => !visible);
    onHelp?.();
  };

  return (
    <Panel
      position="top-right"
      className="border border-border-grey rounded-sm bg-white text-blue-hover font-bold flex text-sm divide-x divide-border-grey"
    >
      <ToolbarButton
        trailingIcon="pencil-square"
        label="Volitelný název diagramu"
        onClick={onRename}
      />

      <ToolbarButton icon="download" label="Export" onClick={onExport} />

      <div className="relative">
        <ToolbarButton
          trailingIcon="question-circle"
          onClick={toggleEdgeHelp}
          ariaLabel="Vysvětlit zakončení vztahů"
          ariaPressed={showEdgeHelp}
        />

        {showEdgeHelp && (
          <div
            role="dialog"
            aria-label="Vysvětlení zakončení vztahů"
            className="nodrag nopan absolute right-0 top-[calc(100%+0.5rem)] h-[70px] w-56 overflow-hidden rounded-md border border-border-grey bg-white p-2 pr-8 text-dark-blue-subtle shadow-[0_4px_12px_rgba(0,0,0,0.24)]"
          >
            <button
              type="button"
              onClick={() => setShowEdgeHelp(false)}
              aria-label="Zavřít nápovědu"
              className="absolute right-1.5 top-1.5 flex rounded p-0.5 text-dark-blue-subtle hover:bg-page-background"
            >
              <GovIcon name="x-lg" size="xs" />
            </button>

            <div className="grid h-full grid-cols-[56px_1fr] items-center gap-x-2 gap-y-1 text-[11px] font-bold leading-[1.1]">
              <EdgeEnding kind="relation" />
              <span>Běžný vztah</span>

              <EdgeEnding kind="hierarchy" />
              <span>Hierarchie – šipka míří k nadřazenému pojmu</span>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};

const EdgeEnding = ({ kind }: { kind: 'relation' | 'hierarchy' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 56 16"
    className="h-4 w-14 overflow-visible text-card-description"
  >
    <line
      x1="2"
      y1="8"
      x2="46"
      y2="8"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    {kind === 'relation' ? (
      <path
        d="M 41 2 L 52 8 L 41 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    ) : (
      <path
        d="M 39 1 L 53 8 L 39 15 Z"
        fill="white"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    )}
  </svg>
);
