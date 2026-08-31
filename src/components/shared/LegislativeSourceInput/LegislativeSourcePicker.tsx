import { useState } from 'react';
import {
  GovFormInput,
  GovFormMessage,
  GovIcon,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { LegislativeSourceAutocomplete } from '@/components/shared/LegislativeSourceInput/LegislativeSourceAutocomplete';
import { LegislativeSourceSelected } from '@/components/shared/LegislativeSourceInput/LegislativeSourceSelected';
import { LegislativeSource } from '@/components/shared/LegislativeSourceInput/types';
import { useActiveAnchor } from '@/hooks/useActiveAnchor';

import { LegislativeSourceDetail } from './LegislativeSourceDetail';

interface Props {
  value: string | null;
  onChange: (_iri: string) => void;
  anchor?: string;
  onRemove?: () => void;
  autoFocus?: boolean;
  id: string;
  allowManualEntry?: boolean;
  initialManualEntry?: boolean;
  onManualEntry?: () => void;
  onBlur?: () => void;
  error?: string;
}

export const LegislativeSourcePicker = ({
  value,
  onChange,
  anchor,
  onRemove,
  autoFocus,
  id,
  allowManualEntry = true,
  initialManualEntry = false,
  onManualEntry,
  onBlur,
  error,
}: Props) => {
  const t = useTranslations('LegislativeSource');
  const isActive = useActiveAnchor(anchor);

  const selectedIri = value ?? '';
  const [selected, setSelected] = useState<LegislativeSource | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(initialManualEntry);
  const [manualValue, setManualValue] = useState('');

  const setIri = (iri: string) => onChange(iri);

  const handleSelectSource = (source: LegislativeSource) => {
    setSelected(source);
    setIri('');
    setIsDetailOpen(true);
  };

  const handleClear = () => {
    if (onRemove) {
      onRemove();
      return;
    }
    setSelected(null);
    setIri('');
  };

  const handleManualEntry = () => {
    setSelected(null);
    setIri(manualValue);
    setIsManualEntry(true);
    onManualEntry?.();
  };

  const handlePickerEntry = () => {
    setIri('');
    setIsManualEntry(false);
  };

  const handleManualChange = (iri: string) => {
    setManualValue(iri);
    setIri(iri);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDetailOpen(open);
    if (!open && !selectedIri) {
      setSelected(null);
    }
  };

  return (
    <div
      className={clsx(
        'relative min-h-15 flex flex-col justify-center py-1',
        isActive && 'bg-blue-subtle',
      )}
      id={anchor}
    >
      {allowManualEntry && isManualEntry ? (
        <div className="flex flex-col">
          <GovFormInput
            value={selectedIri}
            onGovInput={(event) => handleManualChange(event.detail.value ?? '')}
            onGovBlur={onBlur}
            placeholder={t('ManualPlaceholder')}
            inputType="text"
            id={id}
            invalid={!!error}
            className="border-0!"
          >
            <button
              slot="icon-end"
              type="button"
              data-action="clear"
              aria-label={t('RemoveManualEntry')}
              className="cursor-pointer flex items-center"
              onClick={handleClear}
            >
              <GovIcon type="components" name="x" size="2xl" color="primary" />
            </button>
          </GovFormInput>
          {error && (
            <GovFormMessage color="error" slot="bottom">
              {error}
            </GovFormMessage>
          )}
          <button
            type="button"
            onClick={handlePickerEntry}
            className="self-end cursor-pointer py-1 text-sm font-bold text-accent"
          >
            {t('SelectFromList')}
          </button>
        </div>
      ) : selected ? (
        <LegislativeSourceDetail
          source={selected}
          open={isDetailOpen}
          onOpenChange={handleOpenChange}
          onClear={handleClear}
          selectedIri={selectedIri || null}
          onSelectIri={setIri}
          id={id}
        />
      ) : selectedIri ? (
        <LegislativeSourceSelected iri={selectedIri} onClear={handleClear} />
      ) : (
        <div className="flex flex-col">
          <LegislativeSourceAutocomplete
            onSourceSelect={handleSelectSource}
            autoFocus={autoFocus}
            id={id}
          />
          {allowManualEntry && (
            <button
              type="button"
              onClick={handleManualEntry}
              className="self-end cursor-pointer py-1 text-sm font-bold text-accent"
            >
              {t('EnterManually')}
            </button>
          )}
        </div>
      )}
      {error && !isManualEntry && (
        <GovFormMessage color="error" slot="bottom">
          {error}
        </GovFormMessage>
      )}
    </div>
  );
};
