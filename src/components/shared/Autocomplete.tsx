import { ReactNode, useEffect, useRef } from 'react';
import { GovFormInput, GovIcon } from '@gov-design-system-ce/react';

type Props<T> = {
  query: string;
  onQueryChange: (_query: string) => void;
  results: T[];
  isFetching: boolean;
  getItemKey: (_item: T) => string;
  renderItem: (_item: T) => ReactNode;
  onSelect: (_item: T) => void;
  placeholder?: string;
  loadingMessage?: string;
  emptyMessage?: string;
  autoFocus?: boolean;
  startAdornment?: ReactNode;
  id: string;
};

export const Autocomplete = <T,>({
  query,
  onQueryChange,
  results,
  isFetching,
  getItemKey,
  renderItem,
  onSelect,
  placeholder,
  loadingMessage,
  emptyMessage,
  autoFocus,
  startAdornment,
  id,
}: Props<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showDropdown = query.length > 0;

  useEffect(() => {
    if (!autoFocus) return;
    // Focus this input's own inner <input> on the next frame (once rendered).
    const frame = requestAnimationFrame(() => {
      inputRef.current?.querySelector('input')?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [autoFocus]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onQueryChange('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onQueryChange]);

  const handleSelect = (item: T) => {
    onSelect(item);
    onQueryChange('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <GovFormInput
        ref={inputRef}
        placeholder={placeholder}
        value={query}
        onChange={(e) => onQueryChange(e.currentTarget.value)}
        className="border-0! flex-1"
        type="text"
        id={id}
        iconStart={
          startAdornment ? (
            <span className="flex items-center">{startAdornment}</span>
          ) : (
            <GovIcon name="search" type="components" size="s" />
          )
        }
      />

      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-surface border border-border-default rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isFetching && results.length === 0 ? (
            <div className="flex items-center justify-center gap-2 p-4 text-sm text-foreground-muted">
              <GovIcon
                name="loader"
                type="components"
                size="s"
                className="animate-spin"
              />
              {loadingMessage}
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-foreground-muted">
              {emptyMessage}
            </div>
          ) : (
            results.map((item) => (
              <button
                key={getItemKey(item)}
                type="button"
                onClick={() => handleSelect(item)}
                className="flex w-full items-center gap-1.5 border-b border-border-default p-2 text-left font-bold text-accent hover:bg-surface-page"
              >
                {renderItem(item)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
