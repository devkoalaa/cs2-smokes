import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: BRAND.name,
    short_name: BRAND.name,
    description: BRAND.description,
    lang: 'pt-BR',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: BRAND.background,
    theme_color: BRAND.background,
    categories: ['games', 'sports', 'entertainment'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Partidas', url: '/partidas', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Grupos', url: '/grupos', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
