'use client';

import { useEffect, useMemo, useReducer, useRef } from 'react';
import { GovButton, GovIcon, GovTag } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useGetOntologyDetail } from '@/api/generated';
import { CircularLoader } from '../shared/CircularLoader';

import { DiagramBuilder } from './components/DiagramBuilder';
import { DiagramConceptPicker } from './components/DiagramConceptPicker';
import { withHistory } from './hooks/withHistory';
import { Concept, getConceptId } from './model/concept';
import { diagramReducer, initialDiagramState } from './model/diagram';

export const DictionaryDiagramWrapper = ({ slug }: { slug: string }) => {
  const ontology = useGetOntologyDetail(encodeURIComponent(slug));
  const router = useRouter();
  const t = useTranslations('ConceptDetail');
  const capitalizeFirst = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const ontologyDetail = ontology.data?.data?.ontologyDetail;
  const metadataConcepts = ontology.data?.data?.ontologyMetadata?.concepts;

  const ontologyName = ontologyDetail?.název?.cs;

  const concepts = useMemo(() => {
    const pojmy = ontologyDetail?.pojmy;
    if (!pojmy) return undefined;

    const metaByIri = new Map(
      (metadataConcepts ?? []).map((c) => [c.conceptIri, c]),
    );

    return pojmy.map((concept) => {
      const iri = (concept as { iri?: string }).iri;
      const metadata = iri ? metaByIri.get(iri) : undefined;
      return metadata
        ? ({ ...concept, slug: metadata.slug, metadata } as Concept)
        : concept;
    });
  }, [ontologyDetail, metadataConcepts]);

  const [history, dispatch] = useReducer(withHistory(diagramReducer), {
    past: [],
    present: initialDiagramState,
    future: [],
    inDrag: false,
  });

  const { nodes, edges } = history.present;

  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current || !concepts?.length) return;
    didInit.current = true;
    dispatch({ type: 'init', concepts });
  }, [concepts]);

  const activeConceptIds = useMemo(() => {
    const ids = new Set<string>();
    for (const node of nodes) {
      ids.add(getConceptId(node.data.concept));
      for (const v of node.data.vlastnosti) ids.add(getConceptId(v));
    }
    return ids;
  }, [nodes]);

  return (
    <main className="p-4 bg-primary-subtlest w-full min-h-[calc(100vh-72px)] flex flex-col gap-4">
      <div className="w-full flex justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="flex gap-1 text-blue-primary font-bold items-center text-sm"
          >
            <GovIcon name="chevron-compact-left" size="s" color="primary" />
            {t('Main.ControlPanel.Back')}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">
              {t('Main.ControlPanel.InOntology')}:
            </span>
            <Link
              href={`/dictionary/${ontologyName?.split(' ').join('-')}`}
              className="cursor-pointer"
            >
              <GovTag
                color="success"
                type="subtle"
                size="xs"
                className="w-fit border bg-white! cursor-pointer"
              >
                <GovIcon
                  name="journal-text"
                  slot="icon-start"
                  type="components"
                />
                <span className="font-bold text-blue-primary cursor-pointer">
                  {capitalizeFirst(ontologyName || '')}
                </span>
              </GovTag>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-card-description">
            {activeConceptIds.size} pojmů v diagramu
          </span>
          <GovButton type="outlined" color="neutral" size="s">
            Zavřít
          </GovButton>
          <GovButton type="solid" color="primary" size="s">
            <GovIcon name="floppy" size="s" slot="icon-start" /> Uložit
          </GovButton>
        </div>
      </div>
      <div className="flex w-full gap-4 flex-1">
        {concepts ? (
          <DiagramConceptPicker
            concepts={concepts}
            activeConceptIds={activeConceptIds}
          />
        ) : (
          <div className="flex items-center justify-center flex-300">
            <CircularLoader />
          </div>
        )}
        <DiagramBuilder
          concepts={concepts ?? []}
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
