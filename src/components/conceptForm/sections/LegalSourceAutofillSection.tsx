'use client';

import { useId } from 'react';
import { GovChip } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { ConceptAiSuggestions } from '@/components/conceptForm/components/aiSuggestions/ConceptAiSuggestions';
import { FormSection } from '@/components/conceptForm/components/FormSection';
import { PrefilledSummary } from '@/components/conceptForm/components/PrefilledSummary';
import { LegislativeSourcePicker } from '@/components/shared/LegislativeSourceInput/LegislativeSourcePicker';
import { useLegalSourcePrefill } from '@/hooks/useLegalSourcePrefill';

export const LegalSourceAutofillSection = ({
  ontologySlug,
}: {
  ontologySlug?: string;
}) => {
  const id = useId();
  const t = useTranslations('CreateConcept.LegalSourceAutofill');
  const { fragmentIri, prefilled, selectFragment, forgetDefinition } =
    useLegalSourcePrefill();

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
          onChange={selectFragment}
          value={fragmentIri}
          allowManualEntry={false}
        />
      </div>
      {prefilled ? <PrefilledSummary prefilled={prefilled} /> : null}
      {ontologySlug && fragmentIri ? (
        <div className="px-2.5">
          <ConceptAiSuggestions
            fragmentIri={fragmentIri}
            ontologySlug={ontologySlug}
            onDefinitionApplied={forgetDefinition}
          />
        </div>
      ) : null}
    </FormSection>
  );
};
