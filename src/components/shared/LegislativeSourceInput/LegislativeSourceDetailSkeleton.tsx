export const LegislativeSourceDetailSkeleton = () => (
  <div className="grid grid-cols-3 grid-rows-1 gap-4 flex-1 min-h-0 animate-pulse">
    <div className="flex flex-col gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-gray-200" />
      ))}
    </div>
    <div className="col-span-2 flex flex-col gap-3">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-gray-200"
          style={{ width: `${70 + ((i * 7) % 30)}%` }}
        />
      ))}
    </div>
  </div>
);
