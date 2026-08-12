// Next.js instrumentation hook (runs once per server start). The Azure Monitor
// OpenTelemetry distro is NodeSDK-based and not edge-compatible, so the actual
// setup lives in instrumentation.node.ts and is imported only in the Node.js
// runtime — keeping it out of the edge bundle. See src/instrumentation.node.ts.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation.node');
  }
}
