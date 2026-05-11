import { useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import {
  OntologyMetadataModel,
  useValidateOntology,
  ValidationReport,
  ValidationResult,
  ValidationResultSeverity,
} from '@/api/generated';
import { CircularLoader } from '@/components/shared/CircularLoader';
import { useValidationSideboxStore } from '@/store/validationBoxStore';

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

export const ValidationSummary = ({
  slug,
  metaData,
}: {
  slug: string;
  metaData: OntologyMetadataModel;
}) => {
  const t = useTranslations('DictionaryDetail.ValidationSidebox');

  const [validationReport, setValidationReport] = useState<ValidationReport>();
  const [grouped, setGrouped] = useState<GroupedValidation>();

  const validate = useValidateOntology();
  // const catalogReport = useRequestCatalogRecord();
  const openRule = useValidationSideboxStore((state) => state.openRule);

  const handleValidate = () => {
    validate.mutate(
      { slug: slug, data: metaData },
      {
        onSuccess: (data) => {
          const report = data.data;
          setValidationReport(report);

          const results = report?.results ?? [];
          setGrouped({
            errors: groupByRuleName(
              results.filter((r) => r.severity === 'ERROR'),
            ),
            warnings: groupByRuleName(
              results.filter((r) => r.severity === 'WARNING'),
            ),
            infos: groupByRuleName(
              results.filter((r) => r.severity === 'INFO'),
            ),
          });
        },
      },
    );
  };

  if (validate.isPending)
    return (
      <div className="h-full flex items-start justify-center w-full col-span-4">
        <CircularLoader />
      </div>
    );

  if (!validationReport || !grouped)
    return (
      <div className="col-span-4 flex flex-col items-center pl-10">
        <p className="font-medium text-lg mb-3">{t('NotValidated')}</p>
        <GovButton
          type="solid"
          color="primary"
          size="s"
          onGovClick={handleValidate}
        >
          <GovIcon
            slot="icon-start"
            name="shield-check"
            size="s"
            className="text-white"
          />
          {t('RunValidation')}
        </GovButton>
      </div>
    );

  return (
    <div className="col-span-4 flex flex-col w-full pl-10">
      <div className="w-full flex justify-between items-center mb-3">
        <span className="font-medium text-lg">
          {t('ValidationResult')}{' '}
          <span className="font-normal">
            [{validationReport.results?.length}]
          </span>
        </span>
        <span className="text-sm flex gap-2 items-center">
          <GovIcon name="clock-history" size="s" className="text-black" />
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
            onGovClick={handleValidate}
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

  return (
    <div>
      <span
        className={clsx(
          {
            'text-status-error-700': severity === 'ERROR',
            'text-status-warning-700': severity === 'WARNING',
            'text-footer-separator': severity === 'INFO',
          },
          'font-bold text-sm flex gap-2 items-center pb-2.5',
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
        {label}{' '}
        <span className="text-black/70 font-normal">[{totalCount}]</span>
      </span>
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
        'flex gap-3 bg-white rounded-lg py-2 px-3 border-l-4 items-center justify-between',
        {
          'border-status-error-600': severity === 'ERROR',
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
          onGovClick={onClick}
        >
          {showConceptsLabel}
        </GovButton>
      </div>
    </div>
  );
};
