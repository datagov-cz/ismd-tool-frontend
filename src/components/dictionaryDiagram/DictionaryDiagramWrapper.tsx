'use client';

import { useReducer } from 'react';

import { useGetOntologyDetail } from '@/api/generated';

import { DiagramBuilder } from './components/DiagramBuilder';
import { DiagramConceptPicker } from './components/DiagramConceptPickerSidebox/DiagramConceptPicker';
import { DictionaryDiagramHeader } from './DictionaryDiagramHeader';
import { useActiveConceptIds } from './hooks/useActiveConceptIds';
import { useDiagramConcepts } from './hooks/useDiagramConcepts';
import { useDiagramInitialization } from './hooks/useDiagramInitialization';
import { withHistory } from './hooks/withHistory';
import { diagramReducer, initialDiagramState } from './model/diagram';

export const DictionaryDiagramWrapper = ({ slug }: { slug: string }) => {
  const ontology = useGetOntologyDetail(encodeURIComponent(slug));

  const { ontologyName, concepts } = useDiagramConcepts(ontology.data);

  const [history, dispatch] = useReducer(withHistory(diagramReducer), {
    past: [],
    present: initialDiagramState,
    future: [],
    inDrag: false,
  });

  useDiagramInitialization(concepts, dispatch);

  const { nodes, edges } = history.present;

  const activeConceptIds = useActiveConceptIds(nodes, edges, concepts);

  return (
    <main className="p-4 bg-primary-subtlest w-full min-h-[calc(100vh-72px)] flex flex-col gap-4">
      <DictionaryDiagramHeader
        ontologyName={ontologyName}
        activeConceptCount={activeConceptIds.size}
      />

      <div className="flex w-full gap-4 flex-1">
        <DiagramConceptPicker
          concepts={concepts}
          activeConceptIds={activeConceptIds}
        />

        <DiagramBuilder
          concepts={concepts}
          nodes={nodes}
          edges={edges}
          dispatch={dispatch}
          ontology={slug}
          canUndo={history.past.length > 0}
          canRedo={history.future.length > 0}
        />
      </div>
    </main>
  );
};
