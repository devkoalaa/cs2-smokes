import { ImageResponse } from 'next/og';
import { BRAND, MARK_PATHS } from './brand';

// Ícone da marca em PNG, opaco (sem cantos transparentes, que o WhatsApp e o iOS
// pintam de branco). `scale` é a fração ocupada pelo desenho: menor no "maskable",
// que o Android recorta em círculo.
export function brandIcon(size: number, { scale = 0.6, radius = 0 } = {}) {
  const glyph = Math.round(size * scale);
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BRAND.primary, borderRadius: radius }}>
      <svg width={glyph} height={glyph} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {MARK_PATHS.map(d => <path key={d} d={d} />)}
      </svg>
    </div>,
    { width: size, height: size },
  );
}
