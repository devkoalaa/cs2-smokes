'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Crosshair, Home, LayoutGrid, LogOut, Map as MapIcon, Plus, Shield, UserRound, Users } from 'lucide-react';
import { SteamLoginButton } from '@/components/auth/SteamLoginButton';
import { Wordmark } from '@/components/brand-mark';
import { GithubIcon } from '@/components/github-icon';
import { GroupTile } from '@/components/kit';
import { GROUPS_CHANGED } from '@/components/image-upload';
import { useAuth } from '@/contexts/AuthContext';
import { GroupSummary, trackingApi } from '@/lib/services/tracking.service';

// Casca do app: barra superior, coluna de grupos, menu lateral (computador) e abas
// embaixo (celular). Envolve as páginas de app/(app).

type Item = { label: string; href: string; icon: React.ElementType; match?: (p: string) => boolean };

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [groups, setGroups] = useState<GroupSummary[]>([]);

  useEffect(() => {
    if (!isAuthenticated) { setGroups([]); return; }
    const load = () => trackingApi.status().then(s => setGroups(s.access ? s.groups : [])).catch(() => setGroups([]));
    load();
    // Foto ou nome do grupo trocados na página do grupo: atualiza a barra sem recarregar.
    window.addEventListener(GROUPS_CHANGED, load);
    return () => window.removeEventListener(GROUPS_CHANGED, load);
  }, [isAuthenticated, user?.steamId, pathname.startsWith('/grupos')]);

  const menu: Item[] = [
    { label: 'Início', href: '/', icon: Home, match: p => p === '/' },
    { label: 'Partidas', href: '/partidas', icon: LayoutGrid, match: p => p.startsWith('/partidas') },
    { label: 'Smokes', href: '/smokes', icon: MapIcon, match: p => p.startsWith('/smokes') || p.startsWith('/map/') },
    { label: 'Grupos', href: '/grupos', icon: Users, match: p => p.startsWith('/grupos') || p.startsWith('/convite') },
  ];
  const me: Item = { label: 'Perfil', href: user ? `/perfil/${user.steamId}` : '/perfil', icon: UserRound, match: p => p.startsWith('/perfil') };
  const active = (item: Item) => item.match ? item.match(pathname) : pathname === item.href;

  return <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-surface/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      <Link href="/" aria-label="CS2 Hub, início"><Wordmark /></Link>
      <div className="ml-auto flex items-center gap-2"><SteamLoginButton /></div>
    </header>
    <div className="flex">
      {isAuthenticated && <nav aria-label="Grupos" className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-14 shrink-0 flex-col items-center gap-2 border-r border-border bg-surface py-3 md:flex">
        {groups.map(g => <Link key={g.id} href={`/grupos/${g.id}`} title={g.name} aria-label={g.name}
          className={`rounded-lg ring-offset-2 ring-offset-surface transition hover:scale-105 ${pathname === `/grupos/${g.id}` ? 'ring-2 ring-white/70' : ''}`}><GroupTile id={g.id} name={g.name} src={g.avatarUrl} /></Link>)}
        <Link href="/grupos" title="Grupos" aria-label="Criar ou entrar num grupo" className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-white/15 text-muted-foreground transition hover:border-white/30 hover:text-foreground"><Plus className="h-4 w-4" /></Link>
      </nav>}
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-52 shrink-0 flex-col border-r border-border bg-surface p-3 lg:flex">
        <p className="px-2 text-xs font-semibold text-muted-foreground">Menu</p>
        <nav aria-label="Menu" className="mt-2 space-y-0.5">{menu.map(item => <SideLink key={item.href} item={item} on={active(item)} />)}</nav>
        {isAuthenticated && <>
          <p className="mt-6 px-2 text-xs font-semibold text-muted-foreground">Conta</p>
          <nav aria-label="Conta" className="mt-2 space-y-0.5">
            <SideLink item={me} on={active(me)} />
            <SideLink item={{ label: 'Conexão Steam', href: '/partidas?conexao=1', icon: Crosshair }} on={false} />
            <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition hover:text-loss"><LogOut className="h-4 w-4" />Sair</button>
          </nav>
        </>}
        <div className="mt-auto space-y-1 px-2 text-xs text-muted-foreground">
          <Link href="/privacidade" className="flex items-center gap-2 hover:text-foreground"><Shield className="h-3.5 w-3.5" />Privacidade</Link>
          <a href="https://github.com/devkoalaa" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-foreground"><GithubIcon className="h-3.5 w-3.5" />GitHub</a>
          <p className="pt-2 leading-relaxed">Não afiliado à Valve.</p>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-3 pb-24 pt-4 md:px-6 md:pt-6 lg:pb-10">
        <div className="mx-auto max-w-6xl space-y-5">{children}</div>
        <footer className="mx-auto mt-12 max-w-6xl text-center text-xs text-muted-foreground lg:hidden">
          CS2 Hub · feito pela comunidade · não afiliado à Valve · <Link href="/privacidade" className="underline-offset-4 hover:underline">Privacidade</Link>
        </footer>
      </main>
    </div>
    <nav aria-label="Navegação" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      {[...menu, me].map(item => { const on = active(item); const Icon = item.icon;
        return <Link key={item.label} href={item.href} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${on ? 'text-foreground' : 'text-muted-foreground'}`}>
          <Icon className={`h-5 w-5 ${on ? 'text-primary' : ''}`} />{item.label}</Link>; })}
    </nav>
  </div>;
}

function SideLink({ item, on }: { item: Item; on: boolean }) {
  const Icon = item.icon;
  return <Link href={item.href} aria-current={on ? 'page' : undefined}
    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition ${on ? 'bg-white/[0.07] font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
    <Icon className={`h-4 w-4 ${on ? 'text-primary' : ''}`} />{item.label}</Link>;
}
