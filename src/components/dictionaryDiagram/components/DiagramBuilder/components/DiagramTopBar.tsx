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

      <ToolbarButton trailingIcon="question-circle" onClick={onHelp} />
    </Panel>
  );
};
