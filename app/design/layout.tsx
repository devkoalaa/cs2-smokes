import type { Metadata } from 'next';

// Prévia de design para escolher a direção visual. Fora de buscadores; sai depois da escolha.
export const metadata: Metadata = { title: 'Prévia de design', robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
