import { brandIcon } from '@/lib/brand-image';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return brandIcon(64, { scale: 0.66, radius: 14 });
}
