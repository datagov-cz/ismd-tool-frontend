import { GovButton, GovDropdown, GovIcon } from '@gov-design-system-ce/react';
import { Panel } from '@xyflow/react';
import { useTranslations } from 'next-intl';

import { ToolbarButton } from './ToolbarButton';

type DiagramToolbarProps = {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onLayout: (_direction: 'TB' | 'LR') => void;
  onAddConcept: () => void;
  onClear: () => void;
  canClear: boolean;
};

export const DiagramToolbar = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onLayout,
  onAddConcept,
  onClear,
  canClear,
}: DiagramToolbarProps) => {
  const t = useTranslations('DictionaryDiagram.Toolbar');
  return (
    <Panel
      position="top-left"
      className="border border-border-grey rounded-sm bg-white text-blue-hover font-bold flex text-sm divide-x divide-border-grey"
    >
      <ToolbarButton
        icon="trash"
        label={t('Clear')}
        ariaLabel={t('Clear')}
        labelOnHover
        color="error"
        disabled={!canClear}
        onClick={onClear}
      />
      <div className="flex items-center">
        <ToolbarButton
          icon="arrow-counterclockwise"
          label={t('Undo')}
          disabled={!canUndo}
          onClick={onUndo}
        />

        <span className="h-1/2 w-px bg-border-grey" />

        <ToolbarButton
          icon="arrow-clockwise"
          label={t('Redo')}
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
          {t('Arrange')}
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
            label={t('Hierarchical')}
            onClick={() => onLayout('TB')}
          />

          <ToolbarButton
            icon="share"
            label={t('ByRelationships')}
            onClick={() => onLayout('LR')}
          />

          <ToolbarButton icon="grid" label={t('Grid')} />
        </ul>
      </GovDropdown>

      <ToolbarButton
        icon="plus"
        label={t('NewConcept')}
        onClick={onAddConcept}
        labelOnHover
      />
    </Panel>
  );
};
