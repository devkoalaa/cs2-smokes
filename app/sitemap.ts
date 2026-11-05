import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';
import { MapsService } from '@/lib/services/maps.service';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const maps = await MapsService.getInstance().getAllMaps().catch(() => []);
  return [
    { url: BRAND.url, changeFrequency: 'daily', priority: 1 },
    ...maps.filter(m => m.isActive !== false).map(m => ({ url: `${BRAND.url}/map/${m.id}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
    { url: `${BRAND.url}/privacidade`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
