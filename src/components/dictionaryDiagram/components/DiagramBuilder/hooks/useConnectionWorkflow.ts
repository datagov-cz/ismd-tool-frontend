import { Dispatch, RefObject, useCallback, useMemo, useState } from 'react';
import { Connection } from '@xyflow/react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { RelationshipChoice } from '@/components/dictionaryDiagram/components/RelationshipChooset';
import { HistoryAction } from '@/components/dictionaryDiagram/hooks/withHistory';
import {
  Concept,
  getConceptId,
} from '@/components/dictionaryDiagram/model/concept';
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
  sourceForeign: boolean;
  targetForeign: boolean;
  kind?: RelationshipKind;
} | null;

type UseConnectionWorkflowProps = {
  nodes: ConceptFlowNode[];
  concepts: Concept[];
  edges: ConceptFlowEdge[];
  dispatch: Dispatch<HistoryAction>;
  wrapperRef: RefObject<HTMLDivElement | null>;
};

export const useConnectionWorkflow = ({
  nodes,
  concepts,
  edges,
  dispatch,
  wrapperRef,
}: UseConnectionWorkflowProps) => {
  const t = useTranslations('DictionaryDiagram.Canvas');
  const [chooser, setChooser] = useState<ChooserState>(null);
  const [pending, setPending] = useState<Connection | null>(null);

  const { toLocal, midpointBetweenNodes } = useChooserPosition(wrapperRef);
  const localConceptIds = useMemo(
    () => new Set(concepts.map(getConceptId)),
    [concepts],
  );

  const hasIncompleteObecny = hasIncompleteObecnyEdge(edges);

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
        sourceForeign: source
          ? !localConceptIds.has(getConceptId(source.data.concept))
          : false,
        targetForeign: target
          ? !localConceptIds.has(getConceptId(target.data.concept))
          : false,
        kind,
      });
    },
    [localConceptIds, nodes],
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
        toast.info(t('CompleteRelationshipFirst'), {
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
    [hasIncompleteObecny, nodes, midpointBetweenNodes, openChooser, t],
  );

  const closeChooser = useCallback(() => {
    setChooser(null);
    setPending(null);
  }, []);

  const selectRelationship = useCallback(
    (choice: RelationshipChoice) => {
      const effectiveChoice =
        choice.kind === 'ekvivalence'
          ? { ...choice, swap: chooser?.sourceForeign === true }
          : choice.kind === 'obecny'
            ? {
                ...choice,
                swap: chooser?.sourceForeign
                  ? true
                  : chooser?.targetForeign
                    ? false
                    : choice.swap,
              }
            : choice;
      const foreignTarget = choice.swap
        ? chooser?.sourceForeign
        : chooser?.targetForeign;
      const foreignSource = choice.swap
        ? chooser?.targetForeign
        : chooser?.sourceForeign;
      if (choice.kind === 'hierarchie' && foreignTarget) return;
      if (choice.kind === 'obecny' && foreignSource) return;
      if (
        choice.kind === 'ekvivalence' &&
        chooser?.sourceForeign &&
        chooser.targetForeign
      ) {
        return;
      }

      if (pending) {
        dispatch({
          type: 'connect',
          connection: pending,
          kind: effectiveChoice.kind,
          swap: effectiveChoice.swap,
        });
        setPending(null);
      } else if (chooser) {
        dispatch({
          type: 'setEdgeKind',
          edgeId: chooser.edgeId,
          kind: effectiveChoice.kind,
          swap: effectiveChoice.swap,
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
