import '@xyflow/react/dist/style.css';

import { type Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import { GovButton, GovDropdown, GovIcon } from '@gov-design-system-ce/react';
import {
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type EdgeChange,
  MiniMap,
  type NodeChange,
  Panel,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { useNodesInitialized, useReactFlow } from '@xyflow/react';

import { useConceptDrop } from '../hooks/useConceptDrop';
import { HistoryAction } from '../hooks/withHistory';
import type { Concept } from '../model/concept';
import { type ConceptFlowEdge, type ConceptFlowNode } from '../model/diagram';
import { layoutWithDagre } from '../model/layout';

import { AddNewConceptDialog } from './AddNewConceptDialog';
import { ConceptNode } from './ConceptNode';

const nodeTypes = { concept: ConceptNode };

const ToolbarButton = ({
  icon,
  label,
  trailingIcon,
  onClick,
  disabled,
}: {
  icon?: string;
  label?: string;
  trailingIcon?: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    className="flex gap-2 items-center py-1.5 px-3 hover:bg-blue-subtle transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
    disabled={disabled}
  >
    {icon && (
      <GovIcon type="components" name={icon} color="primary" size="xs" />
    )}
    {label}
    {trailingIcon && (
      <GovIcon type="components" name={trailingIcon} color="primary" size="s" />
    )}
  </button>
);

type DiagramBuilderProps = {
  concepts: Concept[];
  nodes: ConceptFlowNode[];
  edges: ConceptFlowEdge[];
  dispatch: Dispatch<HistoryAction>;
  ontology: string;
  canUndo: boolean;
  canRedo: boolean;
};

const DiagramCanvas = ({
  concepts,
  nodes,
  edges,
  dispatch,
  ontology,
  canRedo,
  canUndo,
}: DiagramBuilderProps) => {
  const { onDrop, onDragOver } = useConceptDrop(dispatch, concepts);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const onNodesChange = useCallback(
    (changes: NodeChange<ConceptFlowNode>[]) =>
      dispatch({ type: 'nodesChange', changes }),
    [dispatch],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange<ConceptFlowEdge>[]) =>
      dispatch({ type: 'edgesChange', changes }),
    [dispatch],
  );
  const onConnect = useCallback(
    (connection: Connection) => {
      console.log(connection, 'test');
      dispatch({ type: 'connect', connection });
    },
    [dispatch],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (
        t.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)
      ) {
        return;
      }
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? 'redo' : 'undo' });
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        dispatch({ type: 'redo' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch]);

  const { fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const didAutoLayout = useRef(false);

  const runLayout = useCallback(
    (direction: 'TB' | 'LR' = 'TB') => {
      const positions = layoutWithDagre(nodes, edges, direction);
      dispatch({ type: 'applyLayout', positions });
      requestAnimationFrame(() => fitView({ duration: 300 }));
    },
    [nodes, edges, dispatch, fitView],
  );

  useEffect(() => {
    if (didAutoLayout.current || !nodesInitialized || nodes.length === 0)
      return;
    didAutoLayout.current = true;
    runLayout('TB');
  }, [nodesInitialized, nodes.length, runLayout]);

  return (
    <div className="flex-1084 bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] rounded-md">
      <ReactFlow<ConceptFlowNode, ConceptFlowEdge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={(e) => console.log(e, 'test')}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        colorMode="system"
      >
        <Panel
          position="top-left"
          className="border border-border-grey rounded-sm bg-white text-blue-hover font-bold flex text-sm divide-x divide-border-grey"
        >
          <div className="flex items-center">
            <ToolbarButton
              icon="arrow-counterclockwise"
              label="Zpět"
              disabled={!canUndo}
              onClick={() => dispatch({ type: 'undo' })}
            />
            <span className="h-1/2 w-px bg-border-grey" />
            <ToolbarButton
              icon="arrow-clockwise"
              label="Znovu"
              disabled={!canRedo}
              onClick={() => dispatch({ type: 'redo' })}
            />
          </div>
          <GovDropdown id="diagram-layout-ismd" position="left">
            <GovButton
              color={'primary'}
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
                onClick={() => runLayout('TB')}
              />
              <ToolbarButton
                icon="share"
                label="Podle vztahů"
                onClick={() => runLayout('LR')}
              />
              <ToolbarButton icon="grid" label="Do mřižky" />
            </ul>
          </GovDropdown>

          <ToolbarButton
            icon="plus"
            label="Nový pojem"
            onClick={() => setOpenAddDialog(true)}
          />
        </Panel>
        <Panel
          position="top-right"
          className="border border-border-grey rounded-sm bg-white text-blue-hover font-bold flex text-sm divide-x divide-border-grey"
        >
          <ToolbarButton
            trailingIcon="pencil-square"
            label="Volitelný název diagramu"
          />
          <ToolbarButton icon="download" label="Export" />
          <ToolbarButton trailingIcon="question-circle" />
        </Panel>
        <Controls className="text-blue-hover" showInteractive={true} />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
      <AddNewConceptDialog
        onClose={() => setOpenAddDialog(false)}
        open={openAddDialog}
        ontology={ontology}
      />
    </div>
  );
};

export const DiagramBuilder = (props: DiagramBuilderProps) => (
  <ReactFlowProvider>
    <DiagramCanvas {...props} />
  </ReactFlowProvider>
);
