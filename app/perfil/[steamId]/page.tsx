'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Users } from 'lucide-react';
import { Header } from '@/components/header';
import { Alert, LoginPrompt, MatchRow, PeriodSelect, StatGrid, UserAvatar } from '@/components/hub-ui';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, mapName } from '@/lib/match';
import { groupsApi, Profile, trackingApi } from '@/lib/services/tracking.service';

export default function ProfilePage({ params }: { params: { steamId: string } }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [days, setDays] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    groupsApi.profile(params.steamId, days).then(p => { if (active) { setProfile(p); setError(''); } }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [isAuthenticated, params.steamId, days]);

  const p = profile;
  return <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto max-w-6xl px-4 py-6 md:py-10 space-y-6">
      {isLoading ? <p role="status">Verificando sua sessão…</p> : !isAuthenticated ? <LoginPrompt text="Entre com a Steam para ver perfis." />
      : error && !p ? <Alert>{error === 'Perfil não encontrado.' ? 'Perfil não encontrado. Perfis só aparecem para quem está em algum grupo junto.' : error}</Alert>
      : !p ? <p role="status" className="text-muted-foreground">Carregando o perfil…</p> : <>
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <UserAvatar src={p.user.avatarUrl} name={p.user.username} className="h-16 w-16 md:h-20 md:w-20" />
            <div className="min-w-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-none truncate" style={{ fontFamily: 'var(--font-new-amsterdam)' }}>{p.user.username}</h1>
              <p className="text-sm text-muted-foreground mt-2">No CS2 Hub desde {formatDate(p.user.memberSince, 'long').replace(/ às.*/, '')}
                {' · '}{p.user.importing ? 'importação automática ligada' : 'sem importação automática'}</p>
              <a href={`https://steamcommunity.com/profiles/${p.user.steamId}`} target="_blank" rel="noreferrer" className="text-sm text-primary inline-flex items-center gap-1 mt-1">Perfil na Steam <ExternalLink className="h-3.5 w-3.5" /></a>
            </div>
          </div>
          <PeriodSelect value={days} onChange={setDays} />
        </section>
        {error && <Alert>{error}</Alert>}
        {!p.stats.matches ? <p className="rounded-xl border border-border p-6 text-muted-foreground">Nenhuma partida no período.</p> : <>
          <StatGrid stats={p.stats} />
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <section className="rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border"><h2 className="text-xl font-semibold">Últimas partidas</h2>
                {!p.user.self && <p className="text-sm text-muted-foreground mt-1">O placar completo abre nas partidas que você também jogou.</p>}</div>
              <ul className="divide-y divide-border">{p.recent.map(m => <li key={m.id}><MatchRow match={m} /></li>)}</ul>
            </section>
            <div className="space-y-6">
              {p.best && <section className="rounded-xl border border-border overflow-hidden"><h2 className="p-4 pb-0 text-lg font-semibold">Melhor partida</h2><MatchRow match={p.best} /></section>}
              <section className="rounded-xl border border-border p-4"><h2 className="text-lg font-semibold">Mapas</h2>
                <ul className="mt-3 space-y-2">{p.maps.slice(0, 7).map(m => <li key={m.map} className="text-sm">
                  <div className="flex justify-between"><span className="capitalize font-medium">{mapName(m.map)}</span>
                    <span className="text-muted-foreground tabular-nums">{m.matches} {m.matches === 1 ? 'partida' : 'partidas'} · {Math.round(100 * m.wins / m.matches)}% vitórias</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${100 * m.wins / m.matches}%` }} /></div>
                </li>)}</ul></section>
            </div>
          </div>
        </>}
        {!!p.groups.length && <section className="rounded-xl border border-border p-4"><h2 className="text-lg font-semibold">{p.user.self ? 'Seus grupos' : 'Grupos em comum'}</h2>
          <div className="mt-3 flex flex-wrap gap-2">{p.groups.map(g => <Link key={g.id} href={`/grupos/${g.id}`} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary/50">
            <Users className="h-3.5 w-3.5 text-primary" />{g.name}<span className="text-muted-foreground">{g.members}</span></Link>)}</div></section>}
        {p.user.self && <OwnSettings importing={p.user.importing} />}
      </>}
    </main>
  </div>;
}

function OwnSettings({ importing }: { importing: boolean }) {
  const { logout } = useAuth();
  const router = useRouter();
  const [allowPreview, setAllowPreview] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => { trackingApi.status().then(s => setAllowPreview(s.allowPreview)).catch(e => setError(e.message)); }, []);
  useEffect(load, [load]);

  async function toggle(value: boolean) {
    setAllowPreview(value);
    try { await groupsApi.preferences(value); } catch (e) { setError((e as Error).message); load(); }
  }
  async function erase() {
    try { await groupsApi.deleteMine(); logout(); router.push('/'); } catch (e) { setError((e as Error).message); }
  }

  return <section className="rounded-xl border border-border p-4 md:p-5 space-y-5">
    <h2 className="text-xl font-semibold">Sua conta</h2>
    {error && <Alert>{error}</Alert>}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="font-medium">Importação automática</p><p className="text-sm text-muted-foreground">{importing ? 'Ligada: as partidas novas entram sozinhas.' : 'Desligada.'}</p></div>
      <Button variant="outline" asChild><Link href="/partidas?conexao=1">{importing ? 'Gerenciar' : 'Ligar'}</Link></Button>
    </div>
    <div className="flex items-center justify-between gap-4">
      <label htmlFor="allow-preview" className="cursor-pointer"><p className="font-medium">Aparecer nas miniaturas dos links</p>
        <p className="text-sm text-muted-foreground">Quando você ou alguém dos seus grupos compartilha uma partida, a imagem do link mostra seus números.</p></label>
      <Switch id="allow-preview" checked={!!allowPreview} disabled={allowPreview === null} onCheckedChange={toggle} />
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
      <div><p className="font-medium">Excluir meus dados</p><p className="text-sm text-muted-foreground">Desliga a importação, tira você dos grupos, apaga os grupos que você criou e libera sua vaga. <Link href="/privacidade" className="text-primary hover:underline">Detalhes</Link>.</p></div>
      <AlertDialog>
        <AlertDialogTrigger asChild><Button variant="outline" className="text-red-300 border-red-500/40">Excluir</Button></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Excluir seus dados do CS2 Hub?</AlertDialogTitle>
            <AlertDialogDescription>Não dá para desfazer. Para voltar depois, você vai precisar de um convite novo. Os seus números continuam no placar das partidas de quem jogou com você, como no placar do próprio jogo.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => void erase()}>Excluir tudo</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </section>;
}
