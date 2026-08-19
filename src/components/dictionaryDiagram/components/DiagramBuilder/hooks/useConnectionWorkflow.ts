import { Dispatch, RefObject, useCallback, useMemo, useState } from 'react';
import { Connection } from '@xyflow/react';
import { toast } from 'react-toastify';

import { RelationshipChoice } from '@/components/dictionaryDiagram/components/RelationshipChooset';
import { HistoryAction } from '@/components/dictionaryDiagram/hooks/withHistory';
import {
  ConceptFlowEdge,
  ConceptFlowNode,
  RelationshipKind,
} from '@/components/dictionaryDiagram/model/diagram';
import { hasIncompleteObecnyEdge } from '../utils/edgeHelpers';

import { useChooserPosition } from './useChooserPosition';

export type ChooserState = {
  edgeId: string;
  x: number;
  y: number;
  sourceLabel: string;
  targetLabel: string;
  kind?: RelationshipKind;
} | null;

type UseConnectionWorkflowProps = {
  nodes: ConceptFlowNode[];
  edges: ConceptFlowEdge[];
  dispatch: Dispatch<HistoryAction>;
  wrapperRef: RefObject<HTMLDivElement | null>;
};

export const useConnectionWorkflow = ({
  nodes,
  edges,
  dispatch,
  wrapperRef,
}: UseConnectionWorkflowProps) => {
  const [chooser, setChooser] = useState<ChooserState>(null);
  const [pending, setPending] = useState<Connection | null>(null);

  const { toLocal, midpointBetweenNodes } = useChooserPosition(wrapperRef);

  const hasIncompleteObecny = useMemo(
    () => hasIncompleteObecnyEdge(edges),
    [edges],
  );

  const openChooser = useCallback(
    (
      edgeId: string,
      sourceId: string,
      targetId: string,
      x: number,
      y: number,
      kind?: RelationshipKind,
    ) => {
      const source = nodes.find((n) => n.id === sourceId);
      const target = nodes.find((n) => n.id === targetId);
      setChooser({
        edgeId,
        x,
        y,
        sourceLabel: source?.data.concept.název?.cs ?? 'A',
        targetLabel: target?.data.concept.název?.cs ?? 'B',
        kind,
      });
    },
    [nodes],
  );

  const onEdgeClick = useCallback(
    (e: React.MouseEvent, edge: ConceptFlowEdge) => {
      const { x, y } = toLocal(e.clientX, e.clientY);
      openChooser(edge.id, edge.source, edge.target, x, y, edge.data?.kind);
    },
    [toLocal, openChooser],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (hasIncompleteObecny) {
        toast.info('Nejdříve přidejte vztah na rozdělanou vazbu.', {
          position: 'bottom-right',
        });
        return;
      }

      setPending(connection);

      const source = nodes.find((n) => n.id === connection.source);
      const target = nodes.find((n) => n.id === connection.target);
      if (!source || !target) return;

      const { x, y } = midpointBetweenNodes(source, target);
      openChooser('pending', connection.source, connection.target, x, y);
    },
    [hasIncompleteObecny, nodes, midpointBetweenNodes, openChooser],
  );

  const closeChooser = useCallback(() => {
    setChooser(null);
    setPending(null);
  }, []);

  const selectRelationship = useCallback(
    (choice: RelationshipChoice) => {
      if (pending) {
        dispatch({
          type: 'connect',
          connection: pending,
          id: crypto.randomUUID(),
          kind: choice.kind,
          swap: choice.swap,
        });
        setPending(null);
      } else if (chooser) {
        dispatch({
          type: 'setEdgeKind',
          edgeId: chooser.edgeId,
          kind: choice.kind,
          swap: choice.swap,
        });
      }
      setChooser(null);
    },
    [pending, chooser, dispatch],
  );

  const removeEdge = useCallback(() => {
    if (!chooser || chooser.edgeId === 'pending') return;

    dispatch({
      type: 'edgesChange',
      changes: [{ id: chooser.edgeId, type: 'remove' }],
    });
    closeChooser();
  }, [chooser, closeChooser, dispatch]);

  return {
    chooser,
    pending,
    onEdgeClick,
    onConnect,
    closeChooser,
    selectRelationship,
    removeEdge,
  };
};
