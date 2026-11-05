import { MARK_PATHS } from '@/lib/brand';

/** Símbolo da marca: quadrado roxo com o desenho de lib/brand.ts. */
export function BrandMark({ className = 'h-10 w-10' }: { className?: string }) {
  return <span className={`flex items-center justify-center rounded-lg bg-primary text-primary-foreground ${className}`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3/5 w-3/5" aria-hidden="true">
      {MARK_PATHS.map(d => <path key={d} d={d} />)}
    </svg>
  </span>;
}

/** Só o desenho, para usar dentro de um fundo que já existe (cabeçalho, menu). */
export function BrandGlyph({ className = 'h-6 w-6' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {MARK_PATHS.map(d => <path key={d} d={d} />)}
  </svg>;
}
