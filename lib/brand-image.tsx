import { ImageResponse } from 'next/og';
import { BRAND, MARK } from './brand';

// Ícone da marca em PNG, opaco (sem cantos transparentes, que o WhatsApp e o iOS
// pintam de branco). `scale` é a fração ocupada pelo desenho: menor no "maskable",
// que o Android recorta em círculo.
export function brandIcon(size: number, { scale = 0.66, radius = 0 } = {}) {
  const glyph = Math.round(size * scale);
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BRAND.primary, borderRadius: radius }}>
      <svg width={glyph} height={glyph} viewBox={MARK.viewBox}>
        <g fill="none" stroke="#ffffff" strokeWidth={MARK.strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {MARK.paths.map(d => <path key={d} d={d} />)}
        </g>
        <circle cx={MARK.dot.cx} cy={MARK.dot.cy} r={MARK.dot.r} fill="#ffffff" />
      </svg>
    </div>,
    { width: size, height: size },
  );
}
