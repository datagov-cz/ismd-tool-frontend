import { MultiSelect } from '@/components/shared/MultiSelect';
import { Select } from '@/components/shared/Select';
import { FormSection } from '../components/FormSection';

const CONTENT_TYPE_OPTIONS = [
  { value: '', label: '' },
  { value: 'identifikační', label: 'Identifikační' },
  { value: 'evidenční', label: 'Evidenční' },
  { value: 'statistické', label: 'Statistické' },
];

const ACQUISITION_METHOD_OPTIONS = [
  { value: '', label: '' },
  { value: 'jiných agend', label: 'Jiných agend' },
  { value: 'provozní', label: 'Provozní' },
];

const SHARING_METHOD_OPTIONS = [
  { value: '', label: '' },
  { value: 'veřejně přístupné', label: 'Veřejně přístupné' },
  { value: 'poskytované na žádost', label: 'Poskytované na žádost' },
  {
    value: 'zpřístupňované pro výkon agendy',
    label: 'Zpřístupňované pro výkon agendy',
  },
];

export const ProclamationSection = () => {
  return (
    <FormSection icon="grid" label="Kategorizace dle vyhlášky 360/2023">
      <Select
        name="contentType"
        label="Typ obsahu údajů"
        options={CONTENT_TYPE_OPTIONS}
      />
      <Select
        name="acquisitionMethod"
        label="Způsob získání údajů"
        options={ACQUISITION_METHOD_OPTIONS}
      />
      <MultiSelect
        name="sharingMethod"
        label="Způsob sdílení údajů"
        options={SHARING_METHOD_OPTIONS}
      />
    </FormSection>
  );
};
