'use client';

import { type ReactNode, useId, useState } from 'react';
import {
  GovButton,
  GovFormLabel,
  GovFormTextarea,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shared/Popover';

type Props = {
  trigger: ReactNode;
  disabled: boolean;
  onConfirm: (_input: { contextText: string }) => void;
};

export const AiActionPopover = ({ trigger, disabled, onConfirm }: Props) => {
  const id = useId();
  const t = useTranslations('CreateOntology.AiSuggestion.Action');
  const [open, setOpen] = useState(false);
  const [contextText, setContextText] = useState('');

  const handleConfirm = () => {
    onConfirm({ contextText });
    setOpen(false);
    setContextText('');
  };

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="bg-surface p-4 border border-border-subtle rounded-lg w-80 space-y-3"
      >
        <div className="flex flex-col gap-1">
          <GovFormLabel size="s" identifier={`${id}-context`}>
            {t('ContextText')}
          </GovFormLabel>
          <GovFormTextarea
            id={`${id}-context`}
            rows={3}
            maxLength={10000}
            value={contextText}
            onChange={(event) =>
              setContextText(event.currentTarget.value ?? '')
            }
          />
        </div>
        <div className="flex justify-end gap-2">
          <GovButton
            type="outlined"
            color="neutral"
            size="s"
            nativeType="button"
            onClick={() => setOpen(false)}
          >
            {t('Cancel')}
          </GovButton>
          <GovButton
            type="solid"
            color="primary"
            size="s"
            nativeType="button"
            onClick={handleConfirm}
          >
            {t('Confirm')}
          </GovButton>
        </div>
      </PopoverContent>
    </Popover>
  );
};
