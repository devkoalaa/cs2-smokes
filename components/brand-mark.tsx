import { MARK } from '@/lib/brand';

function Glyph({ className }: { className: string }) {
  return <svg viewBox={MARK.viewBox} className={className} aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth={MARK.strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {MARK.paths.map(d => <path key={d} d={d} />)}
    </g>
    <circle {...MARK.dot} fill="currentColor" />
  </svg>;
}

/** Símbolo da marca: quadrado roxo com o desenho de lib/brand.ts. */
export function BrandMark({ className = 'h-10 w-10' }: { className?: string }) {
  return <span className={`flex items-center justify-center rounded-lg bg-primary text-primary-foreground ${className}`}>
    <Glyph className="h-[70%] w-[70%]" />
  </span>;
}

/** Só o desenho, para usar dentro de um fundo que já existe (cabeçalho, menu). */
export function BrandGlyph({ className = 'h-6 w-6' }: { className?: string }) {
  return <Glyph className={className} />;
}
