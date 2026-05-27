import { useEffect, useRef, useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { FieldValues, useFormContext } from 'react-hook-form';

import { useFormHistory } from '@/hooks/useFormHistory';

export const FormToolbar = <T extends FieldValues>({
  isPending,
}: {
  isPending: boolean;
}) => {
  const { undo, redo, canUndo, canRedo } = useFormHistory<T>();
  const {
    formState: { isDirty },
  } = useFormContext();
  const t = useTranslations('FormToolbar');

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

  useEffect(() => {
    const undoRef = { fn: undo };
    const redoRef = { fn: redo };

    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      const tag = (e.target as HTMLElement)?.tagName;
      const isEditable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        (e.target as HTMLElement)?.isContentEditable;
      if (isEditable) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoRef.fn();
      }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redoRef.fn();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

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
        <div className="flex items-center gap-6">
          {isDirty && (
            <>
              <div className="flex items-center gap-1.5 text-sm text-status-warning-700 font-bold px-5">
                <span className="bg-status-warning-200 size-2.5 rounded-full" />
                <span>{t('UnsavedChanges')}</span>
              </div>
              <span className="w-px! h-4! bg-blue-primary" />
            </>
          )}
          {(isDirty || canRedo) && (
            <div className="flex gap-2 items-center">
              <GovButton
                type="base"
                color="primary"
                size="s"
                disabled={!canUndo || isPending}
                onGovClick={undo}
                title={t('UndoTitle')}
              >
                <GovIcon
                  type="components"
                  name="arrow-counterclockwise"
                  slot="icon-start"
                />
                {t('Undo')}
              </GovButton>
              <span className="w-px! h-2! bg-blue-primary" />
              <GovButton
                type="base"
                color="primary"
                size="s"
                disabled={!canRedo || isPending}
                onGovClick={redo}
                title={t('RedoTitle')}
              >
                <GovIcon
                  type="components"
                  name="arrow-counterclockwise"
                  slot="icon-start"
                  className="rotate-y-180"
                />
                {t('Redo')}
              </GovButton>
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
            {t('Cancel')}
          </GovButton>
          <GovButton
            type="solid"
            color="primary"
            size="s"
            nativeType="submit"
            disabled={isPending}
          >
            <GovIcon type="components" name="floppy" slot="icon-start" />
            {t('Save')}
          </GovButton>
        </div>
      </div>
      <div ref={sentinelRef} />
    </>
  );
};
