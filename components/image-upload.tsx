'use client';

import { useRef, useState } from 'react';
import { checkImage } from '@/lib/services/tracking.service';

/**
 * Botão que abre o seletor de arquivo e já manda a imagem. Valida tipo e tamanho
 * antes de enviar; erros voltam por onError.
 */
export function ImageUpload({ upload, onDone, onError, children, className, label }: {
  upload: (file: File) => Promise<unknown>; onDone: () => void; onError: (message: string) => void;
  children: (busy: boolean) => React.ReactNode; className?: string; label: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file?: File) {
    if (input.current) input.current.value = '';
    if (!file) return;
    const problem = checkImage(file);
    if (problem) return onError(problem);
    setBusy(true);
    try { await upload(file); onDone(); } catch (e) { onError((e as Error).message); } finally { setBusy(false); }
  }

  return <>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-hidden
      onChange={e => void pick(e.target.files?.[0])} />
    <button type="button" aria-label={label} disabled={busy} onClick={() => input.current?.click()} className={className}>{children(busy)}</button>
  </>;
}

/** Avisa o resto do app (lista de grupos da barra lateral) que algo dos grupos mudou. */
export const GROUPS_CHANGED = 'cs2:grupos';
export const notifyGroupsChanged = () => window.dispatchEvent(new Event(GROUPS_CHANGED));
