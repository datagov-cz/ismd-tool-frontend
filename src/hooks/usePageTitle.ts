'use client';

import { useEffect } from 'react';

export const usePageTitle = (type: string, name?: string) => {
  useEffect(() => {
    const normalizedName = name?.trim();
    const pageTitle = normalizedName ? `${type} - ${normalizedName}` : type;
    const title = `${pageTitle} | ISMD`;
    const applyTitle = () => {
      if (document.title !== title) document.title = title;
    };

    applyTitle();

    const observer = new MutationObserver(applyTitle);
    observer.observe(document.head, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [name, type]);
};
