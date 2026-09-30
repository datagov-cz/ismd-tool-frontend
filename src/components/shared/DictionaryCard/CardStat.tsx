export const CardStat = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="space-x-1.5">
    <span className="text-foreground-muted text-2xs">{label}</span>
    <span className="text-xs">{value}</span>
  </div>
);
