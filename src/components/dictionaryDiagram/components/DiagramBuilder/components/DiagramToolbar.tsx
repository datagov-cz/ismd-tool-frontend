import { GovButton, GovDropdown, GovIcon } from '@gov-design-system-ce/react';
import { Panel } from '@xyflow/react';

import { ToolbarButton } from './ToolbarButton';

type DiagramToolbarProps = {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onLayout: (_direction: 'TB' | 'LR') => void;
  onAddConcept: () => void;
};

export const DiagramToolbar = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onLayout,
  onAddConcept,
}: DiagramToolbarProps) => {
  return (
    <Panel
      position="top-left"
      className="border border-border-grey rounded-sm bg-white text-blue-hover font-bold flex text-sm divide-x divide-border-grey"
    >
      <div className="flex items-center">
        <ToolbarButton
          icon="arrow-counterclockwise"
          label="Zpět"
          disabled={!canUndo}
          onClick={onUndo}
        />

        <span className="h-1/2 w-px bg-border-grey" />

        <ToolbarButton
          icon="arrow-clockwise"
          label="Znovu"
          disabled={!canRedo}
          onClick={onRedo}
        />
      </div>

      <GovDropdown id="diagram-layout-ismd" position="left">
        <GovButton
          color="primary"
          type="base"
          size="s"
          className="h-8! [&_button]:h-8! rounded-none!"
        >
          <GovIcon
            type="components"
            name="magic"
            color="primary"
            size="xs"
            slot="icon-start"
          />
          Uspořádat diagram
          <GovIcon
            type="components"
            name="chevron-down"
            color="primary"
            size="s"
            slot="icon-end"
          />
        </GovButton>

        <ul slot="list">
          <ToolbarButton
            icon="diagram-3"
            label="Hierarchicky"
            onClick={() => onLayout('TB')}
          />

          <ToolbarButton
            icon="share"
            label="Podle vztahů"
            onClick={() => onLayout('LR')}
          />

          <ToolbarButton icon="grid" label="Do mřižky" />
        </ul>
      </GovDropdown>

      <ToolbarButton icon="plus" label="Nový pojem" onClick={onAddConcept} />
    </Panel>
  );
};
