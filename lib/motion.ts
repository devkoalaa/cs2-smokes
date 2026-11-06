import type { CSSProperties } from 'react';

/** Entrada em sequência (sobe e aparece), com atraso por posição. */
export const rise = (i = 0): CSSProperties => ({ animation: 'rise .5s cubic-bezier(.2,.8,.2,1) both', animationDelay: `${Math.min(i, 12) * 60}ms` });
