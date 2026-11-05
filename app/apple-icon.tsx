import { brandIcon } from '@/lib/brand-image';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Quadrado cheio: o iOS arredonda sozinho.
export default function AppleIcon() {
  return brandIcon(180, { scale: 0.58 });
}
