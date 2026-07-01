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
}: Props<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLGovFormInputElement>(null);

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
        onGovInput={(e) => onQueryChange(e.detail.value)}
        className="border-0! flex-1"
        inputType="text"
      >
        {startAdornment ? (
          <span slot="icon-start" className="flex items-center">
            {startAdornment}
          </span>
        ) : null}
        <GovIcon name="search" slot="icon-end" type="components" size="s" />
      </GovFormInput>

      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isFetching && results.length === 0 ? (
            <div className="flex items-center justify-center gap-2 p-4 text-sm text-gray-500">
              <GovIcon
                name="loader"
                type="components"
                size="s"
                className="animate-spin"
              />
              {loadingMessage}
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {emptyMessage}
            </div>
          ) : (
            results.map((item) => (
              <button
                key={getItemKey(item)}
                type="button"
                onClick={() => handleSelect(item)}
                className="flex w-full items-center gap-1.5 border-b border-border-subtlest p-2 text-left font-bold text-blue-primary hover:bg-primary-subtlest"
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
