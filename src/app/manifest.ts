import type { MetadataRoute } from 'next';

import { normalizeBasePath } from '@/lib/basePath';

export default function manifest(): MetadataRoute.Manifest {
  const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

  return {
    id: `${basePath}/`,
    name: 'ISMD Nástroj',
    short_name: 'ISMD Nástroj',
    description: 'ISMD Nástroj',
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: `${basePath}/icon-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: `${basePath}/icon-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
