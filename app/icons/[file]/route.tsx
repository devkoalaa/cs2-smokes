import { brandIcon } from '@/lib/brand-image';

// Ícones do app instalado (manifest): /icons/icon-192.png, icon-512.png e maskable-512.png.
const ICONS: Record<string, () => Response> = {
  'icon-192.png': () => brandIcon(192),
  'icon-512.png': () => brandIcon(512),
  'maskable-512.png': () => brandIcon(512, { scale: 0.52 }),
};

export const dynamic = 'force-static';
export function generateStaticParams() { return Object.keys(ICONS).map(file => ({ file })); }

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const icon = ICONS[(await params).file];
  return icon ? icon() : new Response('Não encontrado', { status: 404 });
}
