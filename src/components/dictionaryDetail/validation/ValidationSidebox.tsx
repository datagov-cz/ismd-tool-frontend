'use client';

import { useState } from 'react';
import {
  GovAccordion,
  GovAccordionItem,
  GovButton,
  GovIcon,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { ValidationResult, ValidationResultSeverity } from '@/api/generated';
import { Sidebox } from '@/components/shared/Sidebox';
import { useValidationSideboxStore } from '@/store/validationBoxStore';

import { ValidationRule } from './ValidationSummary';

type SeverityConfig = {
  iconName: string;
  iconColor: 'error' | 'warning' | 'primary';
  textColor: string;
  tagColor: string;
  labelKey: 'PriorityHigh' | 'PriorityMedium' | 'PriorityLow';
  bgColor: string;
};

const severityConfig: Record<ValidationResultSeverity, SeverityConfig> = {
  ERROR: {
    iconName: 'shield-x',
    iconColor: 'error',
    textColor: 'text-status-error-700',
    tagColor: 'error',
    labelKey: 'PriorityHigh',
    bgColor: '[&_summary]:bg-status-error-100',
  },
  WARNING: {
    iconName: 'shield-exclamation',
    iconColor: 'warning',
    textColor: 'text-status-warning-700',
    tagColor: 'warning',
    labelKey: 'PriorityMedium',
    bgColor: '[&_summary]:bg-status-warning-100',
  },
  INFO: {
    iconName: 'shield-check',
    iconColor: 'primary',
    textColor: 'text-footer-separator',
    tagColor: 'primary',
    labelKey: 'PriorityLow',
    bgColor: '[&_summary]:bg-primary-subtlest',
  },
};

const ValidationAccordionSection = ({
  rules,
  severity,
  activeRuleName,
  slug,
}: {
  rules: ValidationRule[];
  severity: ValidationResultSeverity;
  activeRuleName: string | null;
  slug: string;
}) => {
  const t = useTranslations('DictionaryDetail.ValidationSidebox');
  const config = severityConfig[severity];

  if (rules.length === 0) return null;

  return (
    <GovAccordion className="space-y-2!">
      {rules.map((item) => (
        <GovAccordionItem
          key={item.ruleName}
          open={activeRuleName === item.ruleName}
          className={clsx(
            `[&_summary]:p-2! before:content-none! [&_details>div]:p-0!`,
            config.bgColor,
          )}
        >
          <span slot="label" className="flex! items-start gap-2">
            <GovIcon
              type="components"
              size="s"
              color={config.iconColor}
              name={config.iconName}
              className="mt-1!"
            />
            <p className={clsx('font-bold', config.textColor)}>
              {item.message} [{item.items.length}]
            </p>
          </span>
          <div>
            {item.items.map((result: ValidationResult, index: number) => (
              <div
                key={result.focusNodeUri}
                className={clsx(
                  'flex justify-between w-full p-2',
                  index !== 0 && 'border-t border-gray-200',
                )}
              >
                <div className="flex gap-2 items-center">
                  <GovIcon
                    type="components"
                    size="s"
                    color="primary"
                    name="card-heading"
                    className="mt-1!"
                  />
                  <p className="font-bold! text-blue-hover">
                    {result.focusNodeName}
                  </p>
                </div>
                <GovButton
                  type="outlined"
                  color="primary"
                  size="xs"
                  href={`${process.env.NEXT_PUBLIC_BASE_PATH}/concept/${slug}-${result.focusNodeName}`}
                >
                  {t('OpenConcept')}
                  <GovIcon
                    slot="icon-end"
                    name="arrow-right"
                    size="l"
                    color="primary"
                  />
                </GovButton>
              </div>
            ))}
          </div>
        </GovAccordionItem>
      ))}
    </GovAccordion>
  );
};

type ActiveFilters = Record<ValidationResultSeverity, boolean>;

export const ValidationSidebox = () => {
  const t = useTranslations('DictionaryDetail.ValidationSidebox');

  const isOpen = useValidationSideboxStore((state) => state.isOpen);
  const activeRuleName = useValidationSideboxStore(
    (state) => state.activeRuleName,
  );
  const grouped = useValidationSideboxStore((state) => state.grouped);
  const close = useValidationSideboxStore((state) => state.close);
  const setActiveRuleName = useValidationSideboxStore(
    (state) => state.setActiveRuleName,
  );
  const timestamp = useValidationSideboxStore((state) => state.timestamp);
  const slug = useValidationSideboxStore((state) => state.slug);

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    ERROR: true,
    WARNING: true,
    INFO: true,
  });

  const toggleFilter = (severity: ValidationResultSeverity) => {
    setActiveFilters((prev) => ({
      ...prev,
      [severity]: !prev[severity],
    }));
    setActiveRuleName(null);
  };

  const totalErrors =
    grouped?.errors.reduce((acc, r) => acc + r.items.length, 0) ?? 0;
  const totalWarnings =
    grouped?.warnings.reduce((acc, r) => acc + r.items.length, 0) ?? 0;
  const totalInfos =
    grouped?.infos.reduce((acc, r) => acc + r.items.length, 0) ?? 0;

  return (
    <Sidebox
      title={
        <span className="flex items-center gap-4">
          <span className="font-bold">{t('Title')}</span>
          {timestamp && (
            <span className="text-sm flex gap-2 items-center text-black/70">
              <GovIcon name="clock-history" size="s" className="text-black" />
              {(() => {
                const d = new Date(timestamp);
                const time = d.toLocaleTimeString('cs-CZ', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const date = d.toLocaleDateString('cs-CZ', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                });
                return `${t('UpdatedAt')} ${time} · ${date}`;
              })()}
            </span>
          )}
        </span>
      }
      isOpen={isOpen}
      setIsOpen={(open) => {
        if (!open) {
          close();
          setActiveFilters({ ERROR: true, WARNING: true, INFO: true });
        }
      }}
    >
      {grouped && (
        <div className="flex flex-col gap-1 h-full overflow-hidden">
          <div className="flex items-center gap-2 pb-3 flex-wrap">
            <GovButton
              type={activeFilters.ERROR ? 'solid' : 'outlined'}
              color="error"
              size="xs"
              onGovClick={() => toggleFilter('ERROR')}
            >
              <GovIcon slot="left-icon" name="shield-x" size="s" />
              {t('PriorityHigh')} [{totalErrors}]
            </GovButton>
            <GovButton
              type={activeFilters.WARNING ? 'solid' : 'outlined'}
              color="warning"
              size="xs"
              onGovClick={() => toggleFilter('WARNING')}
            >
              <GovIcon slot="left-icon" name="shield-exclamation" size="s" />
              {t('PriorityMedium')} [{totalWarnings}]
            </GovButton>
            <GovButton
              type={activeFilters.INFO ? 'solid' : 'outlined'}
              color="primary"
              size="xs"
              onGovClick={() => toggleFilter('INFO')}
            >
              <GovIcon slot="left-icon" name="shield-check" size="s" />
              {t('PriorityLow')} [{totalInfos}]
            </GovButton>
          </div>

          <div className="space-y-2 overflow-y-auto">
            {activeFilters.ERROR && (
              <ValidationAccordionSection
                rules={grouped.errors}
                severity="ERROR"
                activeRuleName={activeRuleName}
                slug={slug}
              />
            )}
            {activeFilters.WARNING && (
              <ValidationAccordionSection
                rules={grouped.warnings}
                severity="WARNING"
                activeRuleName={activeRuleName}
                slug={slug}
              />
            )}
            {activeFilters.INFO && (
              <ValidationAccordionSection
                rules={grouped.infos}
                severity="INFO"
                activeRuleName={activeRuleName}
                slug={slug}
              />
            )}
          </div>
        </div>
      )}
    </Sidebox>
  );
};
