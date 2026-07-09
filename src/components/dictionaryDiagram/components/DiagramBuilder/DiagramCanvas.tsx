import '@xyflow/react/dist/style.css';

import { useCallback, useRef, useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  type EdgeChange,
  MiniMap,
  type NodeChange,
  ReactFlow,
} from '@xyflow/react';

import { AddNewConceptDialog } from '@/components/dictionaryDiagram/components/AddNewConceptDialog';
import { ConceptNode } from '@/components/dictionaryDiagram/components/ConceptNode';
import { LabelDisplayContext } from '@/components/dictionaryDiagram/components/labelDisplayContext';
import { LabeledEdge } from '@/components/dictionaryDiagram/components/LabeledEdge';
import { useConceptDrop } from '@/components/dictionaryDiagram/hooks/useConceptDrop';
import {
  type ConceptFlowEdge,
  type ConceptFlowNode,
} from '@/components/dictionaryDiagram/model/diagram';

import { DiagramToolbar } from './components/DiagramToolbar';
import { DiagramTopBar } from './components/DiagramTopBar';
import { RelationshipChooserOverlay } from './components/RelationshipChooserOverlay';
import type { DiagramBuilderProps } from './DiagramBuilder';
import { useConnectionWorkflow } from './hooks/useConnectionWorkflow';
import { useDiagramLayout } from './hooks/useDiagramLayout';
import { useDisplayEdges } from './hooks/useDisplayEdges';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const nodeTypes = { concept: ConceptNode };
const edgeTypes = { default: LabeledEdge };

export const DiagramCanvas = ({
  concepts,
  nodes,
  edges,
  dispatch,
  ontology,
  canRedo,
  canUndo,
}: DiagramBuilderProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [showFullLabels, setShowFullLabels] = useState(false);

  const { onDrop, onDragOver } = useConceptDrop(dispatch, concepts);

  const {
    chooser,
    pending,
    onEdgeClick,
    onConnect,
    closeChooser,
    selectRelationship,
  } = useConnectionWorkflow({ nodes, edges, dispatch, wrapperRef });

  const { displayEdges } = useDisplayEdges({ edges, dispatch, pending });

  const { runLayout } = useDiagramLayout({ nodes, edges, dispatch });

  useKeyboardShortcuts(dispatch);

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

  return (
    <div
      className="flex-1084 bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] rounded-md relative"
      ref={wrapperRef}
    >
      <LabelDisplayContext.Provider value={showFullLabels}>
        <ReactFlow<ConceptFlowNode, ConceptFlowEdge>
          nodes={nodes}
          edges={displayEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeClick={onEdgeClick}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          colorMode="system"
        >
          <DiagramToolbar
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={() => dispatch({ type: 'undo' })}
            onRedo={() => dispatch({ type: 'redo' })}
            onLayout={runLayout}
            onAddConcept={() => setOpenAddDialog(true)}
          />

          <DiagramTopBar
            onExport={() => {}}
            onRename={() => {}}
            onHelp={() => {}}
          />

          <Controls className="text-blue-hover" showInteractive={true}>
            <ControlButton
              onClick={() => setShowFullLabels((v) => !v)}
              title={
                showFullLabels
                  ? 'Zkrátit popisky vztahů'
                  : 'Zobrazit celé popisky vztahů'
              }
              aria-pressed={showFullLabels}
            >
              <GovIcon
                type="components"
                name={
                  showFullLabels
                    ? 'arrows-collapse-vertical'
                    : 'arrows-expand-vertical'
                }
                color="primary"
                size="xs"
              />
            </ControlButton>
          </Controls>
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </LabelDisplayContext.Provider>

      <RelationshipChooserOverlay
        chooser={chooser}
        onSelect={selectRelationship}
        onClose={closeChooser}
      />

      <AddNewConceptDialog
        onClose={() => setOpenAddDialog(false)}
        open={openAddDialog}
        ontology={ontology}
      />
    </div>
  );
};
