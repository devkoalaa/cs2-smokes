'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Clock3, RefreshCw, Settings2 } from 'lucide-react';
import { Alert, LoginPrompt } from '@/components/hub-ui';
import { ArtHero, MatchArtCard, PageHeader, Panel, PanelTitle, Pill, resultPill, StatTile } from '@/components/kit';
import { rise } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { MatchList, TrackingStatus, trackingApi } from '@/lib/services/tracking.service';
import { formatDate as date, formatNumber as number, mapName, matchPath, modeLabel } from '@/lib/match';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CardsSkeleton, MatchesSkeleton } from '@/components/skeletons';

const adr = (p: { damage: number | null; rounds: number }) => number(p.damage == null || !p.rounds ? null : p.damage / p.rounds);
const hs = (p: { headshots: number | null; kills: number }) => number(p.headshots == null || !p.kills ? null : p.headshots / p.kills * 100, '%');

export default function MatchesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<TrackingStatus | null>(null);
  const [data, setData] = useState<MatchList | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState('30');
  const [mode, setMode] = useState('all');
  const [map, setMap] = useState('');
  const [scope, setScope] = useState('all');
  const [group, setGroup] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const generation = useRef(0);

  const refresh = useCallback(async () => {
    const current = ++generation.current;
    if (!isAuthenticated) { setData(null); setStatus(null); return; }
    setLoading(true); setError('');
    try {
      const nextStatus = await trackingApi.status();
      if (current !== generation.current) return;
      setStatus(nextStatus);
      if (!nextStatus.access) { setData(null); return; }
      // Grupo escolhido fica salvo no navegador; sem escolha, o primeiro da lista.
      const saved = Number(localStorage.getItem('cs2_group'));
      const chosen = nextStatus.groups.find(g => g.id === (group ?? saved))?.id ?? nextStatus.groups[0]?.id ?? null;
      if (chosen !== group) { setGroup(chosen); return; }
      const query = new URLSearchParams({ days, scope: chosen ? scope : 'all', page: String(page) });
      if (mode !== 'all') query.set('mode', mode);
      if (map) query.set('map', map);
      if (chosen) query.set('group', String(chosen));
      const nextData = await trackingApi.list(query);
      if (current === generation.current) setData(nextData);
    } catch (e) { if (current === generation.current) { setError((e as Error).message); setData(null); } }
    finally { if (current === generation.current) setLoading(false); }
  }, [isAuthenticated, user?.steamId, days, mode, map, scope, page, group]);

  useEffect(() => { void refresh(); return () => { generation.current++; }; }, [refresh]);
  // Links antigos (/partidas?conexao=1) agora vão para a página própria da conexão.
  useEffect(() => { if (new URLSearchParams(window.location.search).has('conexao')) router.replace('/conexao'); }, [router]);
  useEffect(() => {
    const timer = setInterval(() => { if (document.visibilityState === 'visible' && isAuthenticated) void refresh(); }, 30000);
    return () => clearInterval(timer);
  }, [refresh, isAuthenticated]);


  const summary = data?.summary;
  const last = page === 1 ? data?.matches[0] : undefined;
  const select = 'rounded-lg border border-border bg-card px-3 py-2 text-sm';

  return <>
    <PageHeader title="Partidas" subtitle={status?.tracking ? (status.tracking.lastError || (!status.tracking.enabled ? 'Importação automática pausada.' : !status.workerOnline ? 'Importação automática fora do ar no momento.'
        : `Importação automática ligada${status.tracking.lastCheckedAt ? ` · última busca ${date(status.tracking.lastCheckedAt)}` : ''}`)) : 'Seu histórico de Premier, Competitivo e Duplas.'}
      actions={!authLoading && isAuthenticated && status?.access !== false ? <>
        <Button variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Atualizar</Button>
        <Button variant="outline" asChild><Link href="/conexao"><Settings2 className="h-4 w-4" />Conexão</Link></Button></> : undefined} />
    {authLoading || (isAuthenticated && !status && !error) ? <MatchesSkeleton />
    : !isAuthenticated ? <LoginPrompt title="Seu histórico de partidas" text="Entre com a Steam para ver o placar completo, o mapa de abates e a evolução das suas partidas." />
    : status && !status.access ? <Panel className="space-y-2 p-8 text-center"><h2 className="font-display text-3xl">Beta fechado</h2>
        <p className="mx-auto max-w-lg text-muted-foreground">O histórico de partidas está liberado só por convite por enquanto. Para entrar, abra o link de convite que alguém do CS2 Hub te mandou.</p>
        <p className="text-sm text-muted-foreground">{status.seats.used} de {status.seats.max} vagas ocupadas.</p></Panel> : <>
      {error && <Alert>{error}</Alert>}
      {status && !status.tracking && !!data?.total && <p className="text-sm text-muted-foreground">Estas partidas foram importadas por quem jogou com você. Para as suas entrarem sozinhas, ligue a <Link href="/conexao" className="font-semibold text-primary hover:underline">importação automática</Link>.</p>}
      {status && !status.tracking && !loading && !data?.total && <Panel className="flex flex-wrap items-center gap-4 p-5 md:p-6">
        <div className="min-w-0 flex-1"><PanelTitle>Ligue a importação automática</PanelTitle>
          <p className="mt-1 text-sm text-muted-foreground">Com dois códigos da Steam, suas partidas novas entram sozinhas, com placar, mapa de abates e comparação com o grupo.</p></div>
        <Button asChild><Link href="/conexao">Conectar a Steam<ArrowRight className="h-4 w-4" /></Link></Button>
      </Panel>}
      <section aria-label="Filtros de partidas" className="flex flex-wrap gap-2" style={rise(1)}>
        <select aria-label="Período" className={select} value={days} onChange={e => { setDays(e.target.value); setPage(1); }}><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="0">Todo o histórico</option></select>
        <select aria-label="Modalidade" className={select} value={mode} onChange={e => { setMode(e.target.value); setPage(1); }}><option value="all">Todas as modalidades</option><option value="competitive">Competitivo 5×5</option><option value="wingman">Duplas 2×2</option></select>
        <select aria-label="Mapa" className={select} value={map} onChange={e => { setMap(e.target.value); setPage(1); }}><option value="">Todos os mapas</option>{data?.maps.map(m => <option key={m} value={m}>{mapName(m).replace(/^./, c => c.toUpperCase())}</option>)}</select>
        {!!status?.groups.length && <select aria-label="Grupo" className={select} value={group ?? ''} onChange={e => { const id = Number(e.target.value); localStorage.setItem('cs2_group', String(id)); setGroup(id); setPage(1); }}>{status.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>}
        <select aria-label="Jogadores" className={select} value={scope} onChange={e => { setScope(e.target.value); setPage(1); }}><option value="all">Minhas partidas</option><option value="together" disabled={!group}>Com alguém do grupo no meu time</option></select>
      </section>
      {last && <ArtHero map={last.map} height="min-h-56 md:min-h-72">
        <div className="rounded-xl bg-surface/95 p-4 ring-1 ring-white/[0.08] backdrop-blur">
          <div className="flex flex-wrap items-center gap-2"><Pill kind="highlight">Última partida</Pill>{resultPill(last.player.scoreFor, last.player.scoreAgainst)}<span className="text-xs text-muted-foreground">{date(last.playedAt)} · {modeLabel(last.mode)}</span></div>
          <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-3">
            <p className="text-xl font-bold capitalize">{mapName(last.map)} · <span className="tabular-nums">{last.player.scoreFor}:{last.player.scoreAgainst}</span></p>
            {[['K/D/A', `${last.player.kills}/${last.player.deaths}/${last.player.assists}`], ['ADR', adr(last.player)], ['HS', hs(last.player)]].map(([l, v]) => <div key={l}><p className="text-[11px] text-muted-foreground">{l}</p><p className="text-sm font-semibold tabular-nums">{v}</p></div>)}
            <Button asChild className="ml-auto"><Link href={matchPath(last.id, last.shareKey)}>Ver partida<ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
        </div>
      </ArtHero>}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile i={2} label="Partidas" value={summary ? summary.matches : '—'} note="no período" />
        <StatTile i={3} label="Vitórias" value={number(summary?.winRate, '%')} note={summary ? `${summary.wins} vitórias · ${summary.draws} empates` : undefined} />
        <StatTile i={4} label="K/D" value={number(summary?.kd)} note={summary ? `${summary.kills} abates · ${summary.deaths} mortes` : undefined} />
        <StatTile i={5} label="ADR" value={number(summary?.adr)} note="dano por round" />
        <div className="col-span-2 lg:col-span-1"><StatTile i={6} label="HS" value={number(summary?.hsPercent, '%')} note="dos abates" /></div>
      </div>
      {(!!data?.evolution.length || !!data?.comparison.length) && <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {!!data?.evolution.length && <Panel className="p-5" style={rise(7)}><PanelTitle aside={<Pill>últimas {data.evolution.length}</Pill>}>ADR por partida</PanelTitle>
          <div className="mt-4 h-52" role="img" aria-label="Gráfico do dano médio por round em cada partida"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.evolution}>
            <defs><linearGradient id="adr" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--color-primary)" stopOpacity={0.4} /><stop offset="1" stopColor="var(--color-primary)" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} /><XAxis dataKey="id" tickFormatter={(id: number) => `#${id}`} tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} width={32} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1b1c21', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10 }} labelFormatter={(_label, payload) => payload?.[0]?.payload?.playedAt ? date(payload[0].payload.playedAt) : 'Partida'} />
            <Area type="monotone" dataKey="adr" name="ADR" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#adr)" connectNulls={false} dot={{ r: 3, fill: 'var(--color-primary)' }} />
          </AreaChart></ResponsiveContainer></div></Panel>}
        {!!data?.comparison.length && <Panel className="p-5" style={rise(8)}>
          <PanelTitle aside={group ? <Link href={`/grupos/${group}`} className="text-sm text-muted-foreground hover:text-foreground">Ver grupo</Link> : undefined}>{status?.groups.find(g => g.id === group)?.name ?? 'Grupo'}</PanelTitle>
          <ul className="mt-3 space-y-2">{[...data.comparison].sort((a, b) => (b.stats.kd ?? 0) - (a.stats.kd ?? 0)).map((member, i) =>
            <li key={member.steamId}><Link href={`/perfil/${member.steamId}`} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-white/[0.06] ${member.steamId === user?.steamId ? 'bg-primary/[0.08] ring-1 ring-primary/20' : 'bg-white/[0.03]'}`}>
              <span className="w-4 text-center font-black text-muted-foreground">{i + 1}</span>
              <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{member.username}</span><span className="text-xs text-muted-foreground">{member.stats.matches} partidas · {number(member.stats.winRate, '%')} vitórias</span></span>
              <span className="text-right"><span className="block text-lg font-bold tabular-nums">{number(member.stats.kd)}</span><span className="text-[11px] text-muted-foreground">K/D</span></span>
            </Link></li>)}</ul>
        </Panel>}
      </div>}
      {status?.access && !status.groups.length && !loading && <p className="text-sm text-muted-foreground">Quer comparar com os amigos? <Link href="/grupos" className="font-semibold text-primary hover:underline">Crie um grupo</Link> e mande o convite.</p>}
      <section className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Histórico</h2><span className="text-sm text-muted-foreground">{loading ? 'Carregando…' : `${data?.total ?? 0} partidas`}</span></div>
        {loading && !data?.matches.length ? <CardsSkeleton n={6} /> : !data?.matches.length ? <Panel className="px-6 py-16 text-center"><Clock3 className="mx-auto mb-4 h-9 w-9 text-muted-foreground" /><h3 className="font-semibold">{loading ? 'Carregando partidas' : 'Nenhuma partida neste filtro'}</h3><p className="mt-2 text-sm text-muted-foreground">{loading ? '' : 'Tente outro período ou modalidade.'}</p></Panel>
        : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{data.matches.map((match, i) => <MatchArtCard key={match.id} i={i + 8} href={matchPath(match.id, match.shareKey)} map={match.map} mode={match.mode} playedAt={match.playedAt}
            scoreFor={match.player.scoreFor} scoreAgainst={match.player.scoreAgainst}>
            <p className="text-sm tabular-nums text-muted-foreground">{match.player.kills}/{match.player.deaths}/{match.player.assists} · ADR {adr(match.player)} · HS {hs(match.player)}</p>
          </MatchArtCard>)}</div>}
        {!!data?.total && data.total > 20 && <div className="flex items-center justify-between"><Button variant="outline" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" />Anterior</Button><span className="text-xs text-muted-foreground">{page} de {Math.ceil(data.total / 20)}</span><Button variant="outline" disabled={page * 20 >= data.total || loading} onClick={() => setPage(p => p + 1)}>Próxima<ChevronRight className="h-4 w-4" /></Button></div>}
      </section>
    </>}
  </>;
}
