// Server-side Application Insights for the Next.js server (BFF requests, outbound
// dependency calls to the backend, and server exceptions) via the Azure Monitor
// OpenTelemetry distro.
//
// Activation model mirrors the backends' enable_app_insights_agent toggle: this
// stays INERT unless OTEL_SERVICE_NAME is set. Terraform injects it per env
// (enable_frontend_app_insights) as the cloud role name, so the code ships
// dormant and telemetry is a per-env flip with no rebuild. initAzureMonitor reads
// the already-injected APPLICATIONINSIGHTS_CONNECTION_STRING for its destination;
// guarding on it too means a missing destination can't throw at startup.
//
// Aliased from useAzureMonitor: the `use` prefix makes react-hooks/SonarJS S6440
// misread this Azure SDK initializer as a conditionally-called React hook.
import { useAzureMonitor as initAzureMonitor } from '@azure/monitor-opentelemetry';

if (
  process.env.OTEL_SERVICE_NAME &&
  process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
) {
  initAzureMonitor();
}
