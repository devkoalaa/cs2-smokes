import { AppShell } from '@/components/app-shell';

// Todas as páginas do site (menos a prévia de design e a tela offline) usam a casca do app.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
