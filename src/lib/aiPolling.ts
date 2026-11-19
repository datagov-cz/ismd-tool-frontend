const POLL_STEPS = [
  { until: 30_000, interval: 2_000 },
  { until: 120_000, interval: 5_000 },
];

const SLOW_POLL_INTERVAL = 10_000;

export const pollInterval = (startedAt: number) => {
  const elapsed = Date.now() - startedAt;
  return (
    POLL_STEPS.find((step) => elapsed < step.until)?.interval ??
    SLOW_POLL_INTERVAL
  );
};
