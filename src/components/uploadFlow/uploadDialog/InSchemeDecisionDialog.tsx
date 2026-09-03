import { useState } from 'react';
import {
  GovButton,
  GovFormCheckbox,
  GovTooltip,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import {
  OntologyMetadataModel,
  UploadFromFileNormalizeMode,
  useUploadFromFile,
} from '@/api/generated';
import { FormSection } from '@/components/conceptForm/components/FormSection';
import { CircularLoader } from '@/components/shared/CircularLoader';
import { ErrorText } from '@/components/shared/ErrorText';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { InSchemeDecisionData } from '../uploadDialog/inSchemeDecision';

interface InSchemeDecisionDialogProps {
  data: InSchemeDecisionData;
  onSuccess: (_value: OntologyMetadataModel) => void;
  onCancel: () => void;
}

export const InSchemeDecisionDialog = ({
  data,
  onSuccess,
  onCancel,
}: InSchemeDecisionDialogProps) => {
  const t = useTranslations('UploadOntology');
  const tError = useTranslations('Errors');
  const invalidator = useQueryInvalidator();

  const [mode, setMode] = useState<UploadFromFileNormalizeMode>(
    UploadFromFileNormalizeMode.NORMALIZE_ALL,
  );
  const [conceptsToNormalize, setConceptsToNormalize] = useState<string[]>(() =>
    data.conceptsMissingInScheme.map((c) => c.conceptIri),
  );
  const [submitError, setSubmitError] = useState<string>();

  const mutation = useUploadFromFile({
    mutation: {
      onSuccess: (res) => {
        if (res.data) {
          invalidator.invalidateOntologyList();
          onSuccess(res.data);
        }
      },
      onError: (error) => {
        setSubmitError(getErrorMessage(error, tError));
      },
    },
  });

  const toggleConcept = (iri: string) =>
    setConceptsToNormalize((prev) =>
      prev.includes(iri) ? prev.filter((i) => i !== iri) : [...prev, iri],
    );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(undefined);
    mutation.mutate({
      data: { file: data.file },
      params: {
        normalizeMode: mode,
        ...(mode === UploadFromFileNormalizeMode.PER_CONCEPT
          ? { conceptsToNormalize }
          : {}),
      },
    });
  };

  if (mutation.isPending) {
    return (
      <FormSection label={t('Decision.Title')} icon="upload">
        <div className="flex items-center justify-center">
          <CircularLoader />
        </div>
      </FormSection>
    );
  }

  const options = [
    UploadFromFileNormalizeMode.NORMALIZE_ALL,
    UploadFromFileNormalizeMode.EXCLUDE_ALL,
    UploadFromFileNormalizeMode.PER_CONCEPT,
  ] as const;

  return (
    <FormSection label={t('Decision.Title')} icon="upload">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <p>{t('Decision.Description')}</p>

        <fieldset className="flex justify-center gap-2">
          {options.map((option) => (
            <GovTooltip placement="top" key={option}>
              <GovTooltip.Trigger asChild>
                <GovButton
                  size="m"
                  type={mode === option ? 'solid' : 'outlined'}
                  color="secondary"
                  onClick={() => setMode(option)}
                >
                  {t(`Decision.Mode.${option}.Label`)}
                </GovButton>
              </GovTooltip.Trigger>
              <GovTooltip.Content>
                {t(`Decision.Mode.${option}.Hint`)}
              </GovTooltip.Content>
            </GovTooltip>
          ))}
        </fieldset>

        {mode === UploadFromFileNormalizeMode.PER_CONCEPT && (
          <ul className="flex flex-col gap-1 max-h-64 overflow-auto bg-surface-page p-2 rounded-lg shadow-subtle">
            {data.conceptsMissingInScheme.map((concept) => (
              <li key={concept.conceptIri}>
                <span className="flex items-center gap-2">
                  <GovFormCheckbox
                    size="m"
                    checked={conceptsToNormalize.includes(concept.conceptIri)}
                    onChange={() => toggleConcept(concept.conceptIri)}
                  />
                  <span title={concept.conceptIri}>
                    {concept.conceptName.replace(/-/g, ' ')}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {submitError && <ErrorText text={submitError} />}

        <div className="flex gap-2 justify-center">
          <GovButton
            size="m"
            type="outlined"
            color="primary"
            nativeType="button"
            onClick={onCancel}
          >
            {t('Decision.Cancel')}
          </GovButton>
          <GovButton size="m" type="solid" color="primary" nativeType="submit">
            {t('Decision.Confirm')}
          </GovButton>
        </div>
      </form>
    </FormSection>
  );
};
