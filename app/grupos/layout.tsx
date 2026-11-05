import type { Metadata } from 'next';

// Área privada: não entra em buscadores.
export const metadata: Metadata = { title: { default: 'Grupos', template: '%s | CS2 Hub' }, robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
