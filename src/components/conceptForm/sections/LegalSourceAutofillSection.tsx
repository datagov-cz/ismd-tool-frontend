'use client';

import { useId, useState } from 'react';
import { GovChip, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  ResolvedLegalSourceDtoEnrichmentStatus,
  resolveLegalSource,
} from '@/api/generated';
import { FormSection } from '@/components/conceptForm/components/FormSection';
import { type ConceptForm } from '@/components/conceptForm/schema/conceptFormSchema';
import { LegislativeSourcePicker } from '@/components/shared/LegislativeSourceInput/LegislativeSourcePicker';

function scrollToAnchor(anchor: string) {
  document
    .getElementById(anchor)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

type Prefilled = {
  definition?: string;
  legalSourceLabel?: string;
  legalSourceBodyHtml?: string;
};

export const LegalSourceAutofillSection = () => {
  const id = useId();
  const t = useTranslations('CreateConcept.LegalSourceAutofill');
  const tLabels = useTranslations('CreateConcept.CommonConceptFields.Labels');
  const { setValue } = useFormContext<ConceptForm>();

  const [autofillValue, setAutofillValue] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState<Prefilled | null>(null);
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
      setAutofillValue(null);
      toast.error(t('LoadError'));
      return;
    }

    const isProvision =
      !!resolved?.fragmentIri &&
      resolved.enrichmentStatus !==
        ResolvedLegalSourceDtoEnrichmentStatus.INVALID_IRI &&
      resolved.enrichmentStatus !==
        ResolvedLegalSourceDtoEnrichmentStatus.SKIPPED_NON_FRAGMENT;

    if (!resolved || !isProvision) {
      setAutofillValue(null);
      toast.error(t('NotProvision'));
      return;
    }

    if (!resolved.fragmentBody) {
      setAutofillValue(null);
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
        </div>
      ) : null}
    </FormSection>
  );
};
