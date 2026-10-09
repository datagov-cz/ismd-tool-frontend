import { useCallback, useEffect, useRef } from 'react';
import { useNodesInitialized, useReactFlow } from '@xyflow/react';

import { HistoryAction } from '@/components/dictionaryDiagram/hooks/withHistory';
import {
  ConceptFlowEdge,
  ConceptFlowNode,
} from '@/components/dictionaryDiagram/model/diagram';
import { layoutWithDagre } from '@/components/dictionaryDiagram/model/layout';

type UseDiagramLayoutProps = {
  nodes: ConceptFlowNode[];
  edges: ConceptFlowEdge[];
  dispatch: React.Dispatch<HistoryAction>;
  autoLayout: boolean;
};

export const useDiagramLayout = ({
  nodes,
  edges,
  dispatch,
  autoLayout,
}: UseDiagramLayoutProps) => {
  const { fitView } = useReactFlow();

  const nodesInitialized = useNodesInitialized();
  const didAutoLayout = useRef(false);

  const runLayout = useCallback(
    (direction: 'TB' | 'LR' = 'TB') => {
      const positions = layoutWithDagre(nodes, edges, direction);

      dispatch({
        type: 'applyLayout',
        positions,
      });

      requestAnimationFrame(() => {
        fitView({
          duration: 300,
        });
      });
    },
    [nodes, edges, dispatch, fitView],
  );

  useEffect(() => {
    if (!autoLayout || !nodesInitialized) {
      return;
    }

    if (nodes.length === 0) {
      return;
    }

    if (didAutoLayout.current) {
      return;
    }

    didAutoLayout.current = true;

    runLayout('TB');
  }, [autoLayout, nodesInitialized, nodes.length, runLayout]);

  return {
    runLayout,
  };
};
