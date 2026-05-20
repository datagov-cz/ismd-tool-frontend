import { useEffect, useRef, useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useFormContext } from 'react-hook-form';

export const FormToolbar = ({ isPending }: { isPending: boolean }) => {
  const {
    formState: { isDirty },
  } = useFormContext();

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsFloating(!entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        className={clsx(
          'sticky bottom-0 z-10 py-5 px-6 bg-white flex justify-between items-center transition-shadow duration-200',
          isFloating
            ? 'shadow-[0px_16px_40px_0px_rgba(0,0,0,0.3)]'
            : 'rounded-lg shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]',
        )}
      >
        <div>
          {isDirty && (
            <div className="flex items-center gap-1.5 text-sm text-status-warning-700 font-bold">
              <span className="bg-status-warning-200 size-2.5 rounded-full" />
              <span>Neuložené změny</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <GovButton
            type="outlined"
            color="neutral"
            size="s"
            disabled={isPending}
          >
            Zrušit
          </GovButton>
          <GovButton
            type="solid"
            color="primary"
            size="s"
            nativeType="submit"
            disabled={isPending}
          >
            <GovIcon type="components" name="floppy" slot="icon-start" />
            Uložit
          </GovButton>
        </div>
      </div>
      <div ref={sentinelRef} />
    </>
  );
};
