import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import {
  OntologyMetadataModel,
  useGetValidationReport,
  useValidateOntology,
  ValidationReport,
  ValidationResult,
  ValidationResultSeverity,
} from '@/api/generated';
import { CircularLoader } from '@/components/shared/CircularLoader';
import { useValidationSideboxStore } from '@/store/validationBoxStore';
import { getErrorMessage } from '@/utils/getErrorMessage';

export type ValidationRule = {
  ruleName: string;
  message: string;
  items: ValidationResult[];
};

export type GroupedValidation = {
  errors: ValidationRule[];
  warnings: ValidationRule[];
  infos: ValidationRule[];
};

const groupByRuleName = (items: ValidationResult[]): ValidationRule[] => {
  const map = new Map<string, ValidationRule>();

  items.forEach((item) => {
    if (!item.ruleName || !item.message) return;
    const existing = map.get(item.ruleName);
    if (existing) {
      existing.items.push(item);
    } else {
      map.set(item.ruleName, {
        ruleName: item.ruleName,
        message: item.message,
        items: [item],
      });
    }
  });

  return Array.from(map.values());
};

const groupValidationResults = (
  results: ValidationResult[],
): GroupedValidation => ({
  errors: groupByRuleName(results.filter((r) => r.severity === 'ERROR')),
  warnings: groupByRuleName(results.filter((r) => r.severity === 'WARNING')),
  infos: groupByRuleName(results.filter((r) => r.severity === 'INFO')),
});

export const ValidationSummary = ({
  slug,
  metaData,
}: {
  slug: string;
  metaData: OntologyMetadataModel;
}) => {
  const t = useTranslations('DictionaryDetail.ValidationSidebox');
  const tError = useTranslations('Errors');

  const [validationReport, setValidationReport] = useState<ValidationReport>();
  const [grouped, setGrouped] = useState<GroupedValidation>();

  const createValidationReport = useValidateOntology();
  const getValidationReport = useGetValidationReport(slug, {
    query: { enabled: false },
  });
  const openRule = useValidationSideboxStore((state) => state.openRule);

  const setReport = (report?: ValidationReport) => {
    if (!report) return;

    setValidationReport(report);
    setGrouped(groupValidationResults(report.results ?? []));
  };

  const handleValidate = async () => {
    const updatedAt = metaData.updatedAt
      ? new Date(metaData.updatedAt).getTime()
      : Number.NaN;
    const lastValidationAt = metaData.lastValidationAt
      ? new Date(metaData.lastValidationAt).getTime()
      : Number.NaN;

    if (!Number.isNaN(lastValidationAt) && updatedAt <= lastValidationAt) {
      const { data } = await getValidationReport.refetch();
      setReport(data?.data);
      return;
    }

    createValidationReport.mutate(
      { slug: slug, data: metaData },
      {
        onSuccess: (data) => setReport(data.data),
        onError: (error) => {
          toast.error(getErrorMessage(error, tError));
        },
      },
    );
  };

  if (createValidationReport.isPending || getValidationReport.isFetching)
    return (
      <div className="h-full flex items-start justify-center w-full">
        <CircularLoader />
      </div>
    );

  if (!validationReport || !grouped)
    return (
      <div className="flex flex-col items-center">
        <p className="font-medium text-lg mb-3">{t('NotValidated')}</p>
        <GovButton
          type="solid"
          color="primary"
          size="s"
          onClick={handleValidate}
          iconStart={
            <GovIcon name="shield-check" size="s" className="text-white" />
          }
        >
          {t('RunValidation')}
        </GovButton>
      </div>
    );

  return (
    <div className="flex flex-col w-full">
      <div className="w-full flex justify-between items-center mb-3">
        <span className="font-medium text-lg">
          {t('ValidationResult')}{' '}
          <span className="font-normal">
            [{validationReport.results?.length}]
          </span>
        </span>
        <span className="text-sm flex gap-2 items-center">
          <GovIcon name="clock-history" size="s" className="text-foreground" />
          {(() => {
            const d = new Date(validationReport.timestamp || '');
            const time = d.toLocaleTimeString('cs-CZ', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const date = d.toLocaleDateString('cs-CZ', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            return `${time} · ${date}`;
          })()}
        </span>
      </div>
      <div className="space-y-5">
        <ValidationSection
          rules={grouped.errors}
          totalCount={grouped.errors.reduce(
            (acc, r) => acc + r.items.length,
            0,
          )}
          severity="ERROR"
          label={t('PriorityHigh')}
          onRuleClick={(rule) =>
            openRule(rule, grouped, validationReport.timestamp || null, slug)
          }
        />
        <ValidationSection
          rules={grouped.warnings}
          totalCount={grouped.warnings.reduce(
            (acc, r) => acc + r.items.length,
            0,
          )}
          severity="WARNING"
          label={t('PriorityMedium')}
          onRuleClick={(rule) =>
            openRule(rule, grouped, validationReport.timestamp || null, slug)
          }
        />
        <ValidationSection
          rules={grouped.infos}
          totalCount={grouped.infos.reduce((acc, r) => acc + r.items.length, 0)}
          severity="INFO"
          label={t('PriorityLow')}
          onRuleClick={(rule) =>
            openRule(rule, grouped, validationReport.timestamp || null, slug)
          }
        />
        <div className="w-full flex justify-end px-2">
          <GovButton
            type="outlined"
            color="primary"
            size="xs"
            onClick={handleValidate}
          >
            <GovIcon
              type="components"
              size="s"
              color={'primary'}
              name={'repeat'}
            />
            {t('RevalidateShort')}
          </GovButton>
        </div>
      </div>
    </div>
  );
};

const ValidationSection = ({
  rules,
  totalCount,
  severity,
  label,
  onRuleClick,
}: {
  rules: ValidationRule[];
  totalCount: number;
  severity: ValidationResultSeverity;
  label: string;
  onRuleClick: (_rule: ValidationRule) => void;
}) => {
  const t = useTranslations('DictionaryDetail.ValidationSidebox');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsExpanded((expanded) => !expanded)}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? t('CollapseSection') : t('ExpandSection')}
        className={clsx(
          {
            'text-status-error-700': severity === 'ERROR',
            'text-status-warning-700': severity === 'WARNING',
            'text-status-info': severity === 'INFO',
          },
          'font-bold text-sm flex gap-2 items-center pb-2.5 w-full text-left',
        )}
      >
        <GovIcon
          type="components"
          size="s"
          color={
            severity === 'ERROR'
              ? 'error'
              : severity === 'WARNING'
                ? 'warning'
                : 'primary'
          }
          name={
            severity === 'ERROR'
              ? 'shield-x'
              : severity === 'WARNING'
                ? 'shield-exclamation'
                : 'shield-check'
          }
        />
        <span>
          {label}{' '}
          <span className="text-foreground/70 font-normal">[{totalCount}]</span>
        </span>
        <span className="ml-auto flex items-center justify-center text-current">
          <GovIcon
            type="components"
            name="chevron-down"
            size="s"
            className={clsx(
              isExpanded && 'rotate-180',
              'text-current transition-transform duration-200',
            )}
          />
        </span>
      </button>
      {isExpanded && (
        <div className="space-y-2">
          {rules.map((rule) => (
            <ValidationCard
              key={rule.ruleName}
              label={rule.message}
              count={rule.items.length}
              onClick={() => onRuleClick(rule)}
              severity={severity}
              showConceptsLabel={t('ShowConcepts')}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ValidationCard = ({
  label,
  count,
  onClick,
  severity,
  showConceptsLabel,
}: {
  label: string;
  count: number;
  onClick: () => void;
  severity: ValidationResultSeverity;
  showConceptsLabel: string;
}) => {
  return (
    <div
      className={clsx(
        'flex gap-3 bg-surface rounded-lg py-2 px-3 border-l-4 items-center justify-between',
        {
          'border-border-error': severity === 'ERROR',
          'border-status-warning-600': severity === 'WARNING',
          'border-border-primary-subtle': severity === 'INFO',
        },
      )}
    >
      <span className="break-word text-sm">{label}</span>
      <div className="flex gap-3 items-center">
        <span className="font-bold text-sm">{count}</span>
        <GovButton
          type="outlined"
          className="justify-self-end"
          color="primary"
          size="xs"
          onClick={onClick}
        >
          {showConceptsLabel}
        </GovButton>
      </div>
    </div>
  );
};
