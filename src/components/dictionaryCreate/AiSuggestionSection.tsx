'use client';

import { useId, useState } from 'react';
import {
  GovButton,
  GovChip,
  GovFormCheckbox,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { FormSection } from '@/components/conceptForm/components/FormSection';
import {
  DictionarySuggestionCard,
  type SuggestionItem,
} from '@/components/dictionaryCreate/DictionarySuggestionCard';
import { LegislativeSourcePicker } from '@/components/shared/LegislativeSourceInput/LegislativeSourcePicker';

type DictionarySuggestion = {
  key: string;
  label: string;
  description: string;
  properties: SuggestionItem[];
  relations: SuggestionItem[];
};

const SUGGESTIONS: DictionarySuggestion[] = [
  {
    key: 'vehicle',
    label: 'Vozidlo',
    description:
      'Motorové vozidlo, nemotorové vozidlo nebo tramvaj, které se pohybuje po pozemní komunikaci.',
    properties: [
      {
        key: 'vehicle-registration-number',
        label: 'Registrační značka',
        description:
          'Jednoznačný identifikátor vozidla přidělený při registraci.',
      },
      {
        key: 'vehicle-category',
        label: 'Kategorie vozidla',
        description:
          'Zařazení vozidla podle hmotnosti, počtu míst a účelu užití.',
      },
    ],
    relations: [
      {
        key: 'vehicle-operator',
        label: 'má provozovatele',
        description: 'Vazba na osobu, která vozidlo provozuje.',
      },
      {
        key: 'vehicle-driver',
        label: 'je řízeno řidičem',
        description: 'Vazba na řidiče, který vozidlo v daném okamžiku řídí.',
      },
    ],
  },
  {
    key: 'driver',
    label: 'Řidič',
    description:
      'Účastník provozu na pozemních komunikacích, který řídí motorové nebo nemotorové vozidlo.',
    properties: [
      {
        key: 'driver-licence-number',
        label: 'Číslo řidičského oprávnění',
        description:
          'Identifikátor řidičského oprávnění vydaného obecním úřadem.',
      },
      {
        key: 'driver-point-total',
        label: 'Počet bodů',
        description: 'Aktuální bodové hodnocení řidiče v bodovém systému.',
      },
    ],
    relations: [
      {
        key: 'driver-vehicle',
        label: 'řídí vozidlo',
        description: 'Vazba na vozidlo, které řidič řídí.',
      },
      {
        key: 'driver-offence',
        label: 'dopustil se přestupku',
        description:
          'Vazba na přestupek spáchaný při provozu na pozemních komunikacích.',
      },
    ],
  },
  {
    key: 'road',
    label: 'Pozemní komunikace',
    description:
      'Dopravní cesta určená k užití silničními a jinými vozidly a chodci.',
    properties: [
      {
        key: 'road-class',
        label: 'Třída komunikace',
        description:
          'Zařazení komunikace do třídy podle jejího dopravního významu.',
      },
      {
        key: 'road-length',
        label: 'Délka úseku',
        description:
          'Délka evidovaného úseku pozemní komunikace v kilometrech.',
      },
    ],
    relations: [
      {
        key: 'road-owner',
        label: 'má vlastníka',
        description: 'Vazba na vlastníka pozemní komunikace.',
      },
      {
        key: 'road-sign',
        label: 'je označena dopravní značkou',
        description: 'Vazba na dopravní značky umístěné na komunikaci.',
      },
    ],
  },
];

const ALL_KEYS = SUGGESTIONS.flatMap((suggestion) => [
  suggestion.key,
  ...suggestion.properties.map((property) => property.key),
  ...suggestion.relations.map((relation) => relation.key),
]);

export const AiSuggestionSection = () => {
  const id = useId();
  const t = useTranslations('CreateOntology.AiSuggestion');

  const [legalSource, setLegalSource] = useState<string | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  const allSelected = selectedSuggestions.length === ALL_KEYS.length;

  const toggleSuggestion = (key: string) =>
    setSelectedSuggestions((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );

  const toggleAllSuggestions = () =>
    setSelectedSuggestions(allSelected ? [] : ALL_KEYS);

  return (
    <FormSection
      icon="cpu"
      label={
        <div className="flex items-center gap-x-2">
          {t('SectionLabel')}
          <GovChip type="outlined" color="primary" size="xs">
            {t('Optional')}
          </GovChip>
        </div>
      }
    >
      <div className="px-2.5">{t('SectionDescription')}</div>
      <div className="px-2.5">
        <LegislativeSourcePicker
          id={id}
          onChange={setLegalSource}
          value={legalSource}
        />
      </div>
      {legalSource ? (
        <div className="px-2.5 space-y-2">
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
                total: ALL_KEYS.length,
              })}
            </span>
          </div>

          {SUGGESTIONS.map((suggestion) => (
            <DictionarySuggestionCard
              key={suggestion.key}
              id={`${id}-${suggestion.key}`}
              label={suggestion.label}
              description={suggestion.description}
              properties={suggestion.properties}
              relations={suggestion.relations}
              checked={selectedSuggestions.includes(suggestion.key)}
              onToggle={() => toggleSuggestion(suggestion.key)}
              selectedItems={selectedSuggestions}
              onToggleItem={toggleSuggestion}
            />
          ))}

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
