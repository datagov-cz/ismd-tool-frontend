import { useEffect, useRef, useState } from 'react';
import { GovButton, GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { FieldValues, useFormContext } from 'react-hook-form';

import { useFormHistory } from '@/hooks/useFormHistory';

type HistoryControls = ReturnType<typeof useFormHistory>;

type FormToolbarProps = {
  isPending: boolean;
  isSaveDisabled?: boolean;
  isHistoryDisabled?: boolean;
  onCancel: () => void;
};

export const FormToolbar = <T extends FieldValues>({
  history,
  ...props
}: FormToolbarProps & { history?: HistoryControls }) =>
  history ? (
    <FormToolbarControls {...props} history={history} />
  ) : (
    <DefaultFormToolbar<T> {...props} />
  );

const DefaultFormToolbar = <T extends FieldValues>(props: FormToolbarProps) => {
  const history = useFormHistory<T>();
  return <FormToolbarControls {...props} history={history} />;
};

const FormToolbarControls = ({
  isPending,
  isSaveDisabled = false,
  isHistoryDisabled = false,
  onCancel,
  history: { undo, redo, canUndo, canRedo },
}: FormToolbarProps & { history: HistoryControls }) => {
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
      if (isPending || isHistoryDisabled) return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      const tag = (e.target as HTMLElement)?.tagName;
      const isEditable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        (e.target as HTMLElement)?.isContentEditable;
      if (isEditable) return;

      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoRef.fn();
      }
      if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redoRef.fn();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, isPending, isHistoryDisabled]);

  return (
    <>
      <div
        className={clsx(
          'sticky bottom-0 z-10 py-5 px-6 bg-surface-card flex justify-between items-center transition-shadow duration-200',
          isFloating ? 'shadow-floating' : 'rounded-lg shadow-subtle',
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
          {(isDirty || canUndo || canRedo) && (
            <div className="flex gap-2 items-center">
              <GovButton
                type="base"
                color="primary"
                size="s"
                disabled={!canUndo || isPending || isHistoryDisabled}
                onClick={undo}
                title={t('UndoTitle')}
                iconStart={
                  <GovIcon type="components" name="arrow-counterclockwise" />
                }
              >
                {t('Undo')}
              </GovButton>
              <span className="w-px! h-2! bg-blue-primary" />
              <GovButton
                type="base"
                color="primary"
                size="s"
                disabled={!canRedo || isPending || isHistoryDisabled}
                onClick={redo}
                title={t('RedoTitle')}
                iconStart={
                  <GovIcon
                    type="components"
                    name="arrow-counterclockwise"
                    className="rotate-y-180"
                  />
                }
              >
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
            onClick={onCancel}
          >
            {t('Cancel')}
          </GovButton>
          <GovButton
            type="solid"
            color="primary"
            size="s"
            nativeType="submit"
            disabled={isPending || isSaveDisabled}
            iconStart={<GovIcon type="components" name="floppy" />}
          >
            {t('Save')}
          </GovButton>
        </div>
      </div>
      <div ref={sentinelRef} />
    </>
  );
};
