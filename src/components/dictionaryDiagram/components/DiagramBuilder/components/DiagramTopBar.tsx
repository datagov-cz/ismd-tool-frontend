import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import { Panel } from '@xyflow/react';
import { useTranslations } from 'next-intl';

import { ToolbarButton } from './ToolbarButton';

type DiagramTopBarProps = {
  onExport?: () => void;
  diagramName?: string;
  renaming: boolean;
  onRename: (_name: string) => Promise<void>;
  onHelp?: () => void;
};

export const DiagramTopBar = ({
  onExport,
  diagramName,
  renaming,
  onRename,
  onHelp,
}: DiagramTopBarProps) => {
  const t = useTranslations('DictionaryDiagram.TopBar');
  const [showEdgeHelp, setShowEdgeHelp] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string>();

  const saveName = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length > 255) {
      setNameError(t('NameTooLong'));
      return;
    }

    setNameError(undefined);
    try {
      await onRename(trimmedName);
      setEditingName(false);
    } catch {
      // The mutation displays the error and the input remains open for retry.
    }
  };

  const toggleEdgeHelp = () => {
    setShowEdgeHelp((visible) => !visible);
    onHelp?.();
  };

  return (
    <Panel
      position="top-right"
      className="border border-border-grey rounded-sm bg-white text-blue-hover font-bold flex text-sm divide-x divide-border-grey"
    >
      {editingName ? (
        <div className="nodrag nopan relative flex items-center gap-2 px-2 py-1">
          <input
            autoFocus
            type="text"
            value={name}
            maxLength={256}
            aria-label={t('DiagramName')}
            aria-invalid={!!nameError}
            onChange={(event) => {
              setName(event.target.value);
              setNameError(undefined);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void saveName();
              if (event.key === 'Escape') {
                setName(diagramName ?? '');
                setNameError(undefined);
                setEditingName(false);
              }
            }}
            className="h-8 w-56 rounded-sm border border-border-grey px-2 font-normal text-dark-primary outline-none focus:border-blue-primary"
          />
          <GovButton
            nativeType="button"
            type="solid"
            color="primary"
            size="s"
            disabled={renaming}
            onGovClick={() => void saveName()}
          >
            {renaming ? t('Saving') : t('Save')}
          </GovButton>
          {nameError && (
            <span className="absolute right-0 top-[calc(100%+0.25rem)] rounded-sm bg-white px-2 py-1 text-xs font-normal text-status-error-600 shadow-subtle">
              {nameError}
            </span>
          )}
        </div>
      ) : (
        <ToolbarButton
          trailingIcon="pencil-square"
          label={diagramName?.trim() || t('OptionalName')}
          onClick={() => {
            setName(diagramName ?? '');
            setNameError(undefined);
            setEditingName(true);
          }}
        />
      )}

      <ToolbarButton
        icon="download"
        label={t('Export')}
        onClick={onExport}
        labelOnHover
      />

      <div className="relative">
        <ToolbarButton
          trailingIcon="question-circle"
          onClick={toggleEdgeHelp}
          ariaLabel={t('ExplainEdges')}
          ariaPressed={showEdgeHelp}
        />

        {showEdgeHelp && (
          <div
            role="dialog"
            aria-label={t('EdgeHelp')}
            className="nodrag nopan absolute right-0 top-[calc(100%+0.5rem)] h-17.5 w-56 overflow-hidden rounded-md border border-border-grey bg-white p-2 pr-8 text-dark-blue-subtle shadow-[0_4px_12px_rgba(0,0,0,0.24)]"
          >
            <button
              type="button"
              onClick={() => setShowEdgeHelp(false)}
              aria-label={t('CloseHelp')}
              className="absolute right-1.5 top-1.5 flex rounded p-0.5 text-dark-blue-subtle hover:bg-page-background"
            >
              <GovIcon name="x-lg" size="xs" />
            </button>

            <div className="grid h-full grid-cols-[56px_1fr] items-center gap-x-2 gap-y-1 text-[11px] font-bold leading-[1.1]">
              <EdgeEnding kind="relation" />
              <span>{t('RegularRelationship')}</span>

              <EdgeEnding kind="hierarchy" />
              <span>{t('HierarchyRelationship')}</span>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};

const EdgeEnding = ({ kind }: { kind: 'relation' | 'hierarchy' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 56 16"
    className="h-4 w-14 overflow-visible text-card-description"
  >
    <line
      x1="2"
      y1="8"
      x2="46"
      y2="8"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    {kind === 'relation' ? (
      <path
        d="M 41 2 L 52 8 L 41 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    ) : (
      <path
        d="M 39 1 L 53 8 L 39 15 Z"
        fill="white"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    )}
  </svg>
);
