import { useTranslations } from 'next-intl';

import { MultiSelect } from '@/components/shared/MultiSelect';
import { Select } from '@/components/shared/Select';
import { FormSection } from '../components/FormSection';

export const ProclamationSection = () => {
  const t = useTranslations('CreateConcept');

  const CONTENT_TYPE_OPTIONS = [
    { value: '', label: '' },
    {
      value: 'identifikační',
      label: t('CommonConceptFields.Options.ContentType.Identification'),
    },
    {
      value: 'evidenční',
      label: t('CommonConceptFields.Options.ContentType.Registration'),
    },
    {
      value: 'statistické',
      label: t('CommonConceptFields.Options.ContentType.Statistical'),
    },
  ];

  const ACQUISITION_METHOD_OPTIONS = [
    { value: '', label: '' },
    {
      value: 'jiných agend',
      label: t(
        'CommonConceptFields.Options.AcquisitionMethod.FromOtherAgendas',
      ),
    },
    {
      value: 'provozní',
      label: t('CommonConceptFields.Options.AcquisitionMethod.Operational'),
    },
  ];

  const SHARING_METHOD_OPTIONS = [
    { value: '', label: '' },
    {
      value: 'veřejně přístupné',
      label: t('CommonConceptFields.Options.SharingMethod.PubliclyAccessible'),
    },
    {
      value: 'poskytované na žádost',
      label: t('CommonConceptFields.Options.SharingMethod.ProvidedOnRequest'),
    },
    {
      value: 'zpřístupňované pro výkon agendy',
      label: t(
        'CommonConceptFields.Options.SharingMethod.AccessibleForAgendaExecution',
      ),
    },
  ];

  return (
    <FormSection
      icon="grid"
      label={t('ProclamationSection.Label')}
      anchor="proclamation"
    >
      <Select
        name="contentType"
        anchor="contentType"
        label={t('ProclamationSection.ContentTypeLabel')}
        options={CONTENT_TYPE_OPTIONS}
      />
      <Select
        name="acquisitionMethod"
        anchor="acquisitionMethod"
        label={t('ProclamationSection.AcquisitionMethodLabel')}
        options={ACQUISITION_METHOD_OPTIONS}
      />
      <MultiSelect
        name="sharingMethod"
        anchor="sharingMethod"
        label={t('ProclamationSection.SharingMethodLabel')}
        options={SHARING_METHOD_OPTIONS}
      />
    </FormSection>
  );
};
