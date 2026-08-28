import { useEffect, useRef } from 'react';

import { clearFormDraft } from './useFormDraft';

interface UseUnsavedChangesGuardOptions {
  enabled: boolean;
  message: string;
  draftKey?: string;
}

export function useUnsavedChangesGuard({
  enabled,
  message,
  draftKey,
}: UseUnsavedChangesGuardOptions) {
  const ignoreNextPopState = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const discardDraft = () => clearFormDraft(draftKey);

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = true;
    };

    const handlePageHide = () => discardDraft();

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      const link =
        target instanceof Element
          ? target.closest<HTMLAnchorElement>('a[href]')
          : null;
      if (!link || link.target === '_blank' || link.hasAttribute('download'))
        return;

      const destination = new URL(link.href, window.location.href);
      const current = new URL(window.location.href);
      if (
        destination.href === current.href ||
        (destination.pathname === current.pathname &&
          destination.search === current.search &&
          destination.hash !== current.hash)
      ) {
        return;
      }

      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      discardDraft();
    };

    const handlePopState = () => {
      if (ignoreNextPopState.current) {
        ignoreNextPopState.current = false;
        return;
      }

      if (window.confirm(message)) {
        discardDraft();
      } else {
        ignoreNextPopState.current = true;
        window.history.forward();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [draftKey, enabled, message]);
}
