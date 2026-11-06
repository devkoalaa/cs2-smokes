'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { Alert, LoginPrompt, MatchRow, PeriodSelect, StatGrid, UserAvatar } from '@/components/hub-ui';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { artBackground, formatDate, mapName } from '@/lib/match';
import { ArtHero, GroupTile, Panel } from '@/components/kit';
import { BannerEditor } from '@/components/banner-editor';
import { rise } from '@/lib/motion';
import { groupsApi, Profile, trackingApi } from '@/lib/services/tracking.service';

export default function ProfilePage() {
  const params = useParams<{ steamId: string }>();
  const { isAuthenticated, isLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [days, setDays] = useState(30);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0); // recarrega depois de trocar o banner

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    groupsApi.profile(params.steamId, days).then(p => { if (active) { setProfile(p); setError(''); } }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [isAuthenticated, params.steamId, days, version]);

  const p = profile;
  return <>
      {isLoading ? <p role="status">Verificando sua sessão…</p> : !isAuthenticated ? <LoginPrompt text="Entre com a Steam para ver perfis." />
      : error && !p ? <Alert>{error === 'Perfil não encontrado.' ? 'Perfil não encontrado. Perfis só aparecem para quem está em algum grupo junto.' : error}</Alert>
      : !p ? <p role="status" className="text-muted-foreground">Carregando o perfil…</p> : <>
        <ArtHero map={p.user.banner.map ?? p.maps[0]?.map ?? 'de_mirage'} image={p.user.banner.url} height="min-h-52 md:min-h-64">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <UserAvatar src={p.user.avatarUrl} name={p.user.username} className="h-16 w-16 ring-2 ring-white/20 md:h-20 md:w-20" />
              <div className="min-w-0">
                <h1 className="truncate font-display text-4xl md:text-5xl">{p.user.username}</h1>
                <p className="mt-1 text-sm text-zinc-300">No CS2 Hub desde {formatDate(p.user.memberSince, 'long').replace(/ às.*/, '')}
                  {' · '}{p.user.importing ? 'importação automática ligada' : 'sem importação automática'}</p>
                <a href={`https://steamcommunity.com/profiles/${p.user.steamId}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-rose-300 hover:text-rose-200">Perfil na Steam <ExternalLink className="h-3.5 w-3.5" /></a>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.user.self && <BannerEditor banner={p.user.banner} favorite={p.maps[0]?.map ?? 'de_mirage'} onChanged={() => setVersion(v => v + 1)} />}
              <PeriodSelect value={days} onChange={setDays} />
            </div>
          </div>
        </ArtHero>
        {error && <Alert>{error}</Alert>}
        {!p.stats.matches ? <Panel className="p-6 text-muted-foreground">Nenhuma partida no período.</Panel> : <>
          <StatGrid stats={p.stats} />
          <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
            {p.best && <div className="space-y-2"><h2 className="text-lg font-bold">Melhor partida</h2><MatchRow match={p.best} i={7} /></div>}
            <div className="space-y-2"><h2 className="text-lg font-bold">Mapas</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{p.maps.slice(0, 6).map((m, i) => <div key={m.map} style={rise(i + 7)} className="group relative h-24 overflow-hidden rounded-xl ring-1 ring-white/[0.06]">
                <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: artBackground(m.map, true) }} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 to-black/20" />
                <div className="relative p-3"><p className="font-bold capitalize">{mapName(m.map)}</p>
                  <p className="text-xs text-zinc-300">{m.wins} de {m.matches} {m.matches === 1 ? 'vitória' : 'vitórias'} · {Math.round(100 * m.wins / m.matches)}%</p></div>
              </div>)}</div></div>
          </div>
          <section className="space-y-3">
            <div><h2 className="text-lg font-bold">Últimas partidas</h2>
              {!p.user.self && <p className="mt-1 text-sm text-muted-foreground">O placar completo abre nas partidas que você também jogou.</p>}</div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{p.recent.map((m, i) => <MatchRow key={m.id} match={m} i={i + 9} />)}</div>
          </section>
        </>}
        {!!p.groups.length && <Panel className="p-4"><h2 className="font-bold">{p.user.self ? 'Seus grupos' : 'Grupos em comum'}</h2>
          <div className="mt-3 flex flex-wrap gap-2">{p.groups.map(g => <Link key={g.id} href={`/grupos/${g.id}`} className="inline-flex items-center gap-2 rounded-lg bg-black/20 py-1 pl-1 pr-3 text-sm ring-1 ring-white/[0.06] transition hover:ring-white/20">
            <GroupTile id={g.id} name={g.name} src={g.avatarUrl} className="h-7 w-7 text-[10px]" />{g.name}<span className="text-muted-foreground">{g.members}</span></Link>)}</div></Panel>}
        {p.user.self && <OwnSettings importing={p.user.importing} />}
      </>}
    </>;
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

  return <section className="space-y-5 rounded-xl bg-card p-4 ring-1 ring-white/[0.06] md:p-5">
    <h2 className="text-lg font-bold">Sua conta</h2>
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
        <AlertDialogTrigger asChild><Button variant="danger">Excluir</Button></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Excluir seus dados do CS2 Hub?</AlertDialogTitle>
            <AlertDialogDescription>Não dá para desfazer. Para voltar depois, você vai precisar de um convite novo. Os seus números continuam no placar das partidas de quem jogou com você, como no placar do próprio jogo.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => void erase()}>Excluir tudo</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </section>;
}
