'use client';

import { useId, useState } from 'react';
import {
  GovButton,
  GovChip,
  GovFormCheckbox,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';

import { resolveLegalSource } from '@/api/generated';
import { FormSection } from '@/components/conceptForm/components/FormSection';
import { SuggestionCard } from '@/components/conceptForm/components/SuggestionCard';
import { type ConceptForm } from '@/components/conceptForm/schema/conceptFormSchema';
import { LegislativeSourcePicker } from '@/components/shared/LegislativeSourceInput/LegislativeSourcePicker';
import { SectionTitle } from '@/components/shared/SectionTitle';

function scrollToAnchor(anchor: string) {
  document
    .getElementById(anchor)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

const SUGGESTION_KEYS = ['name', 'conceptType', 'description'];

type Prefilled = {
  definition?: string;
  legalSourceLabel?: string;
  legalSourceBodyHtml?: string;
};

export const LegalSourceAutofillSection = () => {
  const id = useId();
  const t = useTranslations('CreateConcept.LegalSourceAutofill');
  const tLabels = useTranslations('CreateConcept.CommonConceptFields.Labels');
  const tClassLabels = useTranslations(
    'CreateConcept.ClassCreateFields.Labels',
  );
  const { setValue } = useFormContext<ConceptForm>();

  const [autofillValue, setAutofillValue] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState<Prefilled | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  const allSelected = selectedSuggestions.length === SUGGESTION_KEYS.length;

  const toggleSuggestion = (key: string) =>
    setSelectedSuggestions((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );

  const toggleAllSuggestions = () =>
    setSelectedSuggestions(allSelected ? [] : SUGGESTION_KEYS);

  const handleChange = async (value: string) => {
    setAutofillValue(value);
    setPrefilled(null);

    if (!value) {
      return;
    }

    let resolved;
    try {
      resolved = (await resolveLegalSource({ iri: value })).data;
    } catch {
      toast.error(t('LoadError'));
      return;
    }

    if (!resolved) {
      toast.error(t('NotFound'));
      return;
    }

    setValue('definitionModel.definition.0.name', resolved.fragmentBody, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue('definingLegalSource', [value], { shouldDirty: true });

    setPrefilled({
      definition: resolved.fragmentBody,
      legalSourceLabel: resolved.displayLabel,
      legalSourceBodyHtml: resolved.fragmentBodyHtml,
    });
    toast.success(t('Success'));
  };

  const prefilledRows = prefilled
    ? [
        {
          label: tLabels('Definition'),
          anchor: 'definition',
          value: (
            <span className="text-sm line-clamp-2 text-muted">
              {prefilled.definition}
            </span>
          ),
        },
        {
          label: tLabels('DefiningLegalSource'),
          anchor: 'definingLegalSource',
          value: (
            <span className="flex min-w-0 flex-col items-start text-left">
              <span className="block w-full truncate text-sm leading-4 text-muted">
                {prefilled.legalSourceLabel}
              </span>
              <span
                className="text-sm font-semibold block w-full truncate leading-5"
                dangerouslySetInnerHTML={{
                  __html: prefilled.legalSourceBodyHtml ?? '',
                }}
              />
            </span>
          ),
        },
      ]
    : [];

  return (
    <FormSection
      icon={null}
      label={
        <div className="flex items-center gap-x-2">
          {t('SectionLabel')}
          <GovChip type="outlined" color="primary" size="xs">
            {t('Optional')}
          </GovChip>
        </div>
      }
    >
      {!prefilled ? (
        <div className="px-2.5">{t('SectionDescription')}</div>
      ) : null}
      <div className="px-2.5">
        <LegislativeSourcePicker
          id={id}
          onChange={handleChange}
          value={autofillValue}
        />
      </div>
      {prefilled ? (
        <div className="px-2.5 space-y-2">
          <div className="text-sm font-semibold">{t('PrefilledSummary')}</div>
          <ul className="flex flex-col divide-y divide-border-subtle rounded-lg border border-border-subtle bg-success-subtlest">
            {prefilledRows.map((row) => (
              <li
                key={row.anchor}
                className="grid h-14 grid-cols-[auto_minmax(0,1fr)_minmax(0,2fr)_auto] items-center gap-2 px-2.5"
              >
                <span className="flex items-center justify-center rounded-full border border-success p-0.5 text-success">
                  <GovIcon type="components" name="check-lg" size="xs" />
                </span>
                <span className="font-semibold text-sm">{row.label}</span>
                <div className="min-w-0">{row.value}</div>
                <button
                  type="button"
                  className="shrink-0 cursor-pointer flex items-center"
                  onClick={() => scrollToAnchor(row.anchor)}
                >
                  <GovIcon
                    type="components"
                    name="eye"
                    size="m"
                    color="primary"
                  />
                </button>
              </li>
            ))}
          </ul>
          <div className="text-base my-4">{t('PrefilledDetail')}</div>
          <SectionTitle icon="cpu" label={t('AIAssistTitle')} size="md" />
          <div className="text-base">{t('AIAssistDetail')}</div>
          <div className="flex items-center justify-between gap-2 pt-2">
            <GovButton
              type="outlined"
              color="primary"
              size="s"
              aria-pressed={allSelected}
              onGovClick={toggleAllSuggestions}
            >
              <span className="flex items-center gap-2">
                <GovFormCheckbox
                  id={`${id}-select-all`}
                  checked={allSelected}
                  size="s"
                  aria-hidden="true"
                  className="pointer-events-none"
                />
                {t('SelectAll')}
              </span>
            </GovButton>
            <span className="text-sm text-muted">
              {t('SelectedCount', {
                selected: selectedSuggestions.length,
                total: SUGGESTION_KEYS.length,
              })}
            </span>
          </div>

          <SuggestionCard
            id={`${id}-name`}
            label={tLabels('Name')}
            description="motorové vozidlo, nemotorové vozidlo nebo tramvaj"
            checked={selectedSuggestions.includes('name')}
            onToggle={() => toggleSuggestion('name')}
          />
          <SuggestionCard
            id={`${id}-concept-type`}
            label={tClassLabels('ConceptType')}
            description="Třída / Objekt"
            checked={selectedSuggestions.includes('conceptType')}
            onToggle={() => toggleSuggestion('conceptType')}
          />
          <SuggestionCard
            id={`${id}-description`}
            label={tLabels('Description')}
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            checked={selectedSuggestions.includes('description')}
            onToggle={() => toggleSuggestion('description')}
          />
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted">{t('SuggestionUseful')}</span>
            <GovButton
              type="base"
              color="primary"
              size="s"
              aria-label={t('SuggestionUsefulYes')}
            >
              <GovIcon
                slot="icon-start"
                type="components"
                name="hand-thumbs-up"
              />
            </GovButton>
            <GovButton
              type="base"
              color="primary"
              size="s"
              aria-label={t('SuggestionUsefulNo')}
            >
              <GovIcon
                slot="icon-start"
                type="components"
                name="hand-thumbs-down"
              />
            </GovButton>
          </div>

          <div className="flex justify-center">
            <GovButton type="solid" color="primary">
              {t('ApplySelected')}
            </GovButton>
          </div>
        </div>
      ) : null}
    </FormSection>
  );
};
