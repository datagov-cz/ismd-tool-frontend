export const CardStat = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="space-x-1.5">
    <span className="text-dark-secondary text-[10px]">{label}</span>
    <span className="text-[12px]">{value}</span>
  </div>
);
