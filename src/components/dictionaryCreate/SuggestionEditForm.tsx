'use client';

import { useId, useState } from 'react';
import {
  GovButton,
  GovFormInput,
  GovFormLabel,
  GovFormSelect,
  GovFormTextarea,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { AiDraftClassDtoType } from '@/api/generated';
import type { DraftEdit } from '@/lib/vocabularyDraft/apply';
import type { DraftItem } from '@/lib/vocabularyDraft/types';

type Props = {
  item: DraftItem;
  onSave: (_edit: DraftEdit) => void;
  onCancel: () => void;
};

export const SuggestionEditForm = ({ item, onSave, onCancel }: Props) => {
  const id = useId();
  const t = useTranslations('CreateOntology.AiSuggestion');
  const [name, setName] = useState(item.data.name?.cs ?? '');
  const [definition, setDefinition] = useState(item.data.definition?.cs ?? '');
  const [explanation, setExplanation] = useState(
    item.data.explanation?.cs ?? '',
  );
  const [type, setType] = useState<AiDraftClassDtoType>(
    item.kind === 'class'
      ? (item.data.type ?? AiDraftClassDtoType.CLASS)
      : AiDraftClassDtoType.CLASS,
  );

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }
    onSave({
      name: name.trim(),
      definition: definition.trim(),
      explanation,
      type: item.kind === 'class' ? type : undefined,
    });
  };

  return (
    <div className="space-y-2 rounded-lg border border-border-subtle p-3 bg-surface">
      <div className="flex flex-col gap-1">
        <GovFormLabel size="s" identifier={`${id}-name`}>
          {t('Edit.Name')}
        </GovFormLabel>
        <GovFormInput
          id={`${id}-name`}
          value={name}
          onChange={(event) => setName(event.currentTarget.value ?? '')}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleSave();
            }
          }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <GovFormLabel size="s" identifier={`${id}-definition`}>
          {t('Edit.Definition')}
        </GovFormLabel>
        <GovFormTextarea
          id={`${id}-definition`}
          rows={3}
          value={definition}
          onChange={(event) => setDefinition(event.currentTarget.value ?? '')}
        />
      </div>
      <div className="flex flex-col gap-1">
        <GovFormLabel size="s" identifier={`${id}-explanation`}>
          {t('Edit.Explanation')}
        </GovFormLabel>
        <GovFormTextarea
          id={`${id}-explanation`}
          rows={3}
          value={explanation}
          onChange={(event) => setExplanation(event.currentTarget.value ?? '')}
        />
      </div>
      {item.kind === 'class' ? (
        <div className="flex flex-col gap-1">
          <GovFormLabel size="s" identifier={`${id}-type`}>
            {t('Edit.Type')}
          </GovFormLabel>
          <GovFormSelect
            id={`${id}-type`}
            size="m"
            value={type}
            onChange={(event) =>
              setType(event.currentTarget.value as AiDraftClassDtoType)
            }
          >
            {Object.values(AiDraftClassDtoType).map((value) => (
              <option key={value} value={value}>
                {t(`ConceptType.${value}`)}
              </option>
            ))}
          </GovFormSelect>
        </div>
      ) : null}
      <div className="flex justify-end gap-2">
        <GovButton
          type="outlined"
          color="neutral"
          size="s"
          nativeType="button"
          onClick={onCancel}
        >
          {t('Edit.Cancel')}
        </GovButton>
        <GovButton
          type="solid"
          color="primary"
          size="s"
          nativeType="button"
          disabled={!name.trim()}
          onClick={handleSave}
        >
          {t('Edit.Save')}
        </GovButton>
      </div>
    </div>
  );
};
