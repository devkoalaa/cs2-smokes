import type { Metadata } from 'next';
import { BrandMark } from '@/components/brand-mark';
import { RetryButton } from './retry-button';

export const metadata: Metadata = { title: 'Sem conexão', robots: { index: false, follow: false } };

export default function OfflinePage() {
  return <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
    <BrandMark className="h-14 w-14" />
    <h1 className="font-display text-5xl leading-none">Sem conexão</h1>
    <p className="max-w-sm text-muted-foreground">O CS2 Hub precisa de internet para mostrar partidas e smokes. Quando a conexão voltar, é só tentar de novo.</p>
    <RetryButton />
  </main>;
}
