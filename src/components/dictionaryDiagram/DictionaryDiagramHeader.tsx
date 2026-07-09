'use client';

import { GovButton, GovIcon, GovTag } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { capitalizeFirst } from './utils/capitalizeFirst';

type DictionaryDiagramHeaderProps = {
  ontologyName?: string;
  activeConceptCount: number;
};

export const DictionaryDiagramHeader = ({
  ontologyName,
  activeConceptCount,
}: DictionaryDiagramHeaderProps) => {
  const router = useRouter();
  const t = useTranslations('ConceptDetail');

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
        <span className="text-sm text-card-description">
          {activeConceptCount} pojmů v diagramu
        </span>

        <GovButton type="outlined" color="neutral" size="s">
          Zavřít
        </GovButton>

        <GovButton type="solid" color="primary" size="s">
          <GovIcon name="floppy" size="s" slot="icon-start" />
          Uložit
        </GovButton>
      </div>
    </div>
  );
};
