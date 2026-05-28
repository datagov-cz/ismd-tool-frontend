import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { FileNode } from '@/lib/appTypes';
import { fetchApi } from '@/lib/basePath';

export function useHintRecommendations(isLoggedIn = false): FileNode[] {
  const pathname = usePathname();
  const [recommendations, setRecommendations] = useState<FileNode[]>([]);

  useEffect(() => {
    const params = new URLSearchParams({
      pathname,
      isLoggedIn: String(isLoggedIn),
    });

    fetchApi(`/api/hint-recommendations?${params}`)
      .then((r) => r.json())
      .then((data: { recommendations: FileNode[] }) => {
        setRecommendations(data.recommendations);
      })
      .catch(() => setRecommendations([]));
  }, [pathname, isLoggedIn]);

  return recommendations;
}
