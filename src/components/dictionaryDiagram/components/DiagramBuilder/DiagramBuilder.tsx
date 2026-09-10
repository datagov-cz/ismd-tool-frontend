import { type Dispatch } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import { HistoryAction } from '@/components/dictionaryDiagram/hooks/withHistory';
import { type Concept } from '@/components/dictionaryDiagram/model/concept';
import {
  type ConceptFlowEdge,
  type ConceptFlowNode,
} from '@/components/dictionaryDiagram/model/diagram';

import { DiagramCanvas } from './DiagramCanvas';

export type DiagramBuilderProps = {
  concepts: Concept[];
  nodes: ConceptFlowNode[];
  edges: ConceptFlowEdge[];
  autoLayout: boolean;
  dispatch: Dispatch<HistoryAction>;
  ontology: string;
  canUndo: boolean;
  canRedo: boolean;
  focusRequest: { conceptId: string; requestId: number } | null;
  onFocusRequestHandled: () => void;
  onSelectedConceptIdsChange: (_conceptIds: Set<string>) => void;
  pendingConceptIds: ReadonlySet<string>;
  pendingEdgeIds: ReadonlySet<string>;
  diagramName?: string;
  renamingDiagram: boolean;
  onRenameDiagram: (_name: string) => Promise<void>;
};

export const DiagramBuilder = (props: DiagramBuilderProps) => (
  <ReactFlowProvider>
    <DiagramCanvas {...props} />
  </ReactFlowProvider>
);
