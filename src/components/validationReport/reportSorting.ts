import { ValidationReport, ValidationResult } from '@/api/generated';

export const reportSorting = (report: ValidationReport) => {
  const severityOrder: Record<string, number> = {
    ERROR: 0,
    WARNING: 1,
    INFO: 2,
  };

  const groupedResults = report.results?.reduce(
    (acc, result) => {
      const key = result.focusNodeName || 'unknown';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(result);
      return acc;
    },
    {} as Record<string, ValidationResult[]>,
  );

  const sortedGroups = Object.entries(groupedResults || {})
    .map(([focusNodeName, results]) => {
      const resultsBySeverity = results.reduce(
        (acc, result) => {
          const severity = result.severity || 'INFO';
          if (!acc[severity]) {
            acc[severity] = [];
          }
          acc[severity].push(result);
          return acc;
        },
        {} as Record<string, ValidationResult[]>,
      );

      const sortedSeverityGroups = Object.entries(resultsBySeverity).sort(
        ([severityA], [severityB]) => {
          return (
            (severityOrder[severityA] ?? 3) - (severityOrder[severityB] ?? 3)
          );
        },
      );

      return {
        focusNodeName,
        severityGroups: sortedSeverityGroups,
      };
    })
    .sort((a, b) => {
      return a.focusNodeName.localeCompare(b.focusNodeName);
    });

  return sortedGroups;
};
