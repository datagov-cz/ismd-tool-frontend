'use client';

import { GovButton, GovIcon, GovTag } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useSaveLayout } from '@/api/generated';

import {
  buildDiagramLayoutDto,
  ConceptFlowEdge,
  ConceptFlowNode,
} from './model/diagram';
import { capitalizeFirst } from './utils/capitalizeFirst';

type DictionaryDiagramHeaderProps = {
  ontologyName?: string;
  ontologySlug: string;
  nodes: ConceptFlowNode[];
  edges: ConceptFlowEdge[];
  diagramVersion?: number;
};

export const DictionaryDiagramHeader = ({
  ontologyName,
  ontologySlug,
  nodes,
  edges,
  diagramVersion,
}: DictionaryDiagramHeaderProps) => {
  const router = useRouter();
  const t = useTranslations('ConceptDetail');
  const saveLayout = useSaveLayout({
    mutation: {
      onSuccess: () => toast.success('Návrh diagramu byl uložen.'),
      onError: () => toast.error('Návrh diagramu se nepodařilo uložit.'),
    },
  });

  const handleSaveLayout = () => {
    saveLayout.mutate({
      ontologySlug: encodeURIComponent(ontologySlug),
      data: { ...buildDiagramLayoutDto(nodes, edges, diagramVersion ?? 0) },
    });
  };

  return (
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

              <span className="font-bold text-blue-primary">
                {capitalizeFirst(ontologyName ?? '')}
              </span>
            </GovTag>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <GovButton type="outlined" color="neutral" size="s">
          Zavřít
        </GovButton>

        <GovButton
          type="solid"
          color="secondary"
          size="s"
          disabled={saveLayout.isPending}
          onGovClick={handleSaveLayout}
        >
          <GovIcon name="bookmark-plus" size="s" slot="icon-start" />
          {saveLayout.isPending ? 'Ukládání…' : 'Uložit návrh'}
        </GovButton>
        <GovButton type="solid" color="primary" size="s">
          <GovIcon name="floppy" size="s" slot="icon-start" />
          Propsat do slovníku
        </GovButton>
      </div>
    </div>
  );
};
