import { GovFormSelect } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { LawVersionDto } from '@/api/generated';

type Props = {
  versions: LawVersionDto[] | undefined;
  selectedIri: string | null;
  onSelect: (_versionIri: string) => void;
  disabled?: boolean;
};

const formatDate = (iso: string | undefined) =>
  iso ? new Date(iso).toLocaleDateString('cs-CZ') : '';

/**
 * Label a znění by its effective period, e.g. "od 1. 11. 2025 (aktuální)". `ucinnostDo` is
 * null on the open-ended current version, so only the closed ones get a range.
 */
const versionLabel = (v: LawVersionDto, currentSuffix: string) => {
  const from = `od ${formatDate(v.ucinnostOd)}`;
  const range = v.ucinnostDo ? `${from} do ${formatDate(v.ucinnostDo)}` : from;
  return v.latest ? `${range} ${currentSuffix}` : range;
};

export const LegislativeSourceVersionPicker = ({
  versions,
  selectedIri,
  onSelect,
  disabled,
}: Props) => {
  const t = useTranslations('LegislativeSource');

  if (!versions?.length) {
    return null;
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="shrink-0 font-bold">{t('Version')}</span>
      <GovFormSelect
        value={selectedIri ?? ''}
        disabled={disabled}
        onGovChange={(e) => onSelect(e.target.value)}
      >
        {versions.map((v) => (
          <option
            key={v.iri}
            value={v.iri}
            label={versionLabel(v, t('CurrentVersion'))}
          />
        ))}
      </GovFormSelect>
    </label>
  );
};
