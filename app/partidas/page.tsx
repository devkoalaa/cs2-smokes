'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, BarChart3, ChevronLeft, ChevronRight, Clock3, Crosshair, ExternalLink, RefreshCw, Settings2, Trophy, Users } from 'lucide-react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SteamLoginButton } from '@/components/auth/SteamLoginButton';
import { useAuth } from '@/contexts/AuthContext';
import { MatchList, TrackingStatus, trackingApi } from '@/lib/services/tracking.service';
import { formatDate as date, formatNumber as number, mapName, matchPath, modeLabel, resultColor, resultLabel } from '@/lib/match';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const adr = (p: { damage: number | null; rounds: number }) => number(p.damage == null || !p.rounds ? null : p.damage / p.rounds);
const hs = (p: { headshots: number | null; kills: number }) => number(p.headshots == null || !p.kills ? null : p.headshots / p.kills * 100, '%');

export default function MatchesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<TrackingStatus | null>(null);
  const [data, setData] = useState<MatchList | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [days, setDays] = useState('30');
  const [mode, setMode] = useState('all');
  const [map, setMap] = useState('');
  const [scope, setScope] = useState('all');
  const [group, setGroup] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [settings, setSettings] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [shareCode, setShareCode] = useState('');
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
  // Vindo do perfil ("Ligar"/"Gerenciar" importação): abre a conexão.
  useEffect(() => { if (new URLSearchParams(window.location.search).has('conexao')) setSettings(true); }, []);
  useEffect(() => {
    if (!isAuthenticated) { setAuthCode(''); setShareCode(''); }
    const timer = setInterval(() => { if (document.visibilityState === 'visible' && isAuthenticated) void refresh(); }, 30000);
    return () => clearInterval(timer);
  }, [refresh, isAuthenticated]);

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const result = await trackingApi.configure(authCode.trim(), shareCode.trim());
      setAuthCode(''); setShareCode(''); setSettings(false); setMessage(result.message); await refresh();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function disconnect() {
    setBusy(true); setError('');
    try { setMessage((await trackingApi.disconnect()).message); await refresh(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }

  const summary = data?.summary;
  const cards = [
    { label: 'Partidas', value: summary ? String(summary.matches) : '—', note: 'no período selecionado', icon: BarChart3 },
    { label: 'Vitórias', value: number(summary?.winRate, '%'), note: summary ? `${summary.wins} vitórias · ${summary.draws} empates` : 'aguardando partidas', icon: Trophy },
    { label: 'K/D', value: number(summary?.kd), note: summary ? `${summary.kills} eliminações · ${summary.deaths} mortes` : 'eliminações / mortes', icon: Crosshair },
    { label: 'ADR', value: number(summary?.adr), note: 'dano médio por round', icon: Activity },
    { label: 'Headshots', value: number(summary?.hsPercent, '%'), note: 'das eliminações', icon: Crosshair },
  ];

  return <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto max-w-7xl px-4 py-6 md:py-10 space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-5xl md:text-6xl font-bold leading-none" style={{ fontFamily: 'var(--font-new-amsterdam)' }}>Partidas</h1>
        {!authLoading && isAuthenticated && status?.access !== false && <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Atualizar</Button>
          <Button size="sm" variant={settings ? 'default' : 'outline'} onClick={() => setSettings(s => !s)}><Settings2 className="h-4 w-4 mr-2" />Conexão</Button></div>}
      </section>
      {authLoading ? <p role="status">Verificando sua sessão…</p> : !isAuthenticated ?
        <section className="rounded-xl border border-border bg-card/50 p-8 md:p-12 text-center space-y-5"><p className="text-muted-foreground">Entre com a Steam para ver suas partidas.</p><div className="flex justify-center"><SteamLoginButton /></div></section>
      : status && !status.access ? <section className="rounded-xl border border-border bg-card/50 p-8 md:p-12 text-center space-y-3">
          <h2 className="text-2xl font-bold">Beta fechado</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">O histórico de partidas está liberado só por convite por enquanto. Para entrar, abra o link de convite que alguém do CS2 Hub te mandou.</p>
          <p className="text-sm text-muted-foreground">{status.seats.used} de {status.seats.max} vagas ocupadas.</p></section> : <>
        {error && <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>}
        {message && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">{message}</p>}
        {status?.tracking && <p className="flex items-center gap-2 text-sm text-muted-foreground"><span className={`h-2 w-2 shrink-0 rounded-full ${status.tracking.enabled && status.workerOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          {status.tracking.lastError || (!status.tracking.enabled ? 'Importação automática pausada.' : !status.workerOnline ? 'Importação automática fora do ar no momento.'
            : `Importação automática ligada${status.tracking.lastCheckedAt ? ` · última busca ${date(status.tracking.lastCheckedAt)}` : ''}.`)}</p>}
        {status && !status.tracking && !settings && !!data?.total && <p className="text-sm text-muted-foreground">Estas partidas foram importadas por quem jogou com você. Para as suas entrarem sozinhas, use <button type="button" className="text-primary underline-offset-4 hover:underline" onClick={() => setSettings(true)}>Conexão</button>.</p>}
        {status && (settings || (!status.tracking && !loading && !data?.total)) && <section className="rounded-xl border border-primary/30 bg-card/40 p-5 md:p-7">
          <h2 className="text-xl font-semibold">Importar suas partidas automaticamente</h2><p className="text-sm text-muted-foreground mt-2 mb-5">Pegue na Steam o código de autenticação e o código da sua partida mais recente. As próximas partidas entram sozinhas.</p>
          <a href="https://help.steampowered.com/en/wizard/HelpWithGameIssue/?appid=730&issueid=128" target="_blank" rel="noreferrer" className="text-sm text-primary inline-flex items-center gap-2 mb-6">Pegar os códigos na Steam <ExternalLink className="w-4 h-4" /></a>
          <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="tracking-auth">Código de autenticação</Label><Input id="tracking-auth" type="password" autoComplete="off" value={authCode} onChange={e => setAuthCode(e.target.value)} placeholder="AAAA-AAAAA-AAAA" required pattern="[A-Za-z0-9]{4}-[A-Za-z0-9]{5}-[A-Za-z0-9]{4}" maxLength={15} /></div>
            <div className="space-y-2"><Label htmlFor="tracking-match">Código da partida inicial</Label><Input id="tracking-match" autoComplete="off" value={shareCode} onChange={e => setShareCode(e.target.value)} placeholder="CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx" required pattern="CSGO-([A-Za-z0-9]{5}-){4}[A-Za-z0-9]{5}" maxLength={34} /></div>
            <div className="md:col-span-2 flex flex-wrap items-center gap-4"><Button disabled={busy || !status.serverConfigured} type="submit">{busy ? 'Salvando…' : 'Salvar'}<ArrowRight className="w-4 h-4 ml-2" /></Button>
              {status.tracking && <Button variant="outline" type="button" disabled={busy} onClick={() => void disconnect()}>Desconectar</Button>}
              <p className="text-xs text-muted-foreground">{status.serverConfigured ? 'O código fica criptografado no servidor. Desconectar não apaga as partidas já importadas.' : 'O servidor ainda não está configurado.'}</p></div>
          </form>
        </section>}
        <section aria-label="Filtros de partidas" className="grid grid-cols-2 md:flex md:flex-wrap gap-3 items-end">
          <div><Label htmlFor="period">Período</Label><select id="period" className="block w-full md:w-auto bg-card border border-border rounded-md p-2 mt-2" value={days} onChange={e => { setDays(e.target.value); setPage(1); }}><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="0">Todo o histórico</option></select></div>
          <div><Label htmlFor="mode-filter">Modalidade</Label><select id="mode-filter" className="block w-full md:w-auto bg-card border border-border rounded-md p-2 mt-2" value={mode} onChange={e => { setMode(e.target.value); setPage(1); }}><option value="all">Todas</option><option value="competitive">Competitivo 5×5</option><option value="wingman">Duplas 2×2</option></select></div>
          <div><Label htmlFor="map-filter">Mapa</Label><select id="map-filter" className="block w-full md:w-auto bg-card border border-border rounded-md p-2 mt-2" value={map} onChange={e => { setMap(e.target.value); setPage(1); }}><option value="">Todos</option>{data?.maps.map(m => <option key={m} value={m}>{mapName(m).replace(/^./, c => c.toUpperCase())}</option>)}</select></div>
          {!!status?.groups.length && <div><Label htmlFor="group-pick">Grupo</Label><select id="group-pick" className="block w-full md:w-auto bg-card border border-border rounded-md p-2 mt-2" value={group ?? ''} onChange={e => { const id = Number(e.target.value); localStorage.setItem('cs2_group', String(id)); setGroup(id); setPage(1); }}>{status.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>}
          <div><Label htmlFor="group-filter">Jogadores</Label><select id="group-filter" className="block w-full md:w-auto bg-card border border-border rounded-md p-2 mt-2" value={scope} onChange={e => { setScope(e.target.value); setPage(1); }}><option value="all">Minhas partidas</option><option value="together" disabled={!group}>Com alguém do grupo no meu time</option></select></div>
          
        </section>
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">{cards.map(card => <div key={card.label} className="rounded-xl border border-border bg-card/50 p-4 md:p-5 last:col-span-2 lg:last:col-span-1"><div className="flex justify-between text-muted-foreground text-sm"><span>{card.label}</span><card.icon className="w-4 h-4 text-primary" /></div><p className="text-2xl md:text-3xl font-bold mt-2 md:mt-3 tabular-nums">{card.value}</p><p className="text-xs text-muted-foreground mt-2">{card.note}</p></div>)}</section>
        {!!data?.evolution.length && <section className="rounded-xl border border-border p-5"><h2 className="text-xl font-semibold">ADR por partida</h2><p className="text-sm text-muted-foreground mt-2">Últimas 30 partidas do filtro, da mais antiga para a mais recente.</p><div className="h-52 mt-6" role="img" aria-label="Gráfico do dano médio por round em cada partida"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.evolution}><CartesianGrid stroke="#333" strokeDasharray="3 3" /><XAxis dataKey="id" tickFormatter={(id: number) => `#${id}`} tick={{ fill: '#aaa', fontSize: 11 }} /><YAxis tick={{ fill: '#aaa', fontSize: 11 }} width={35} /><Tooltip contentStyle={{ background: '#202020', borderColor: '#444', borderRadius: 8 }} labelFormatter={(_label, payload) => payload?.[0]?.payload?.playedAt ? date(payload[0].payload.playedAt) : 'Partida'} /><Line type="linear" dataKey="adr" name="ADR" stroke="#bf6fff" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} /></LineChart></ResponsiveContainer></div></section>}
        <section className="rounded-xl border border-border overflow-hidden"><div className="p-4 md:p-5 flex justify-between items-center border-b border-border"><h2 className="text-xl font-semibold">Histórico</h2><span className="text-sm text-muted-foreground">{loading ? 'Carregando…' : `${data?.total ?? 0} partidas`}</span></div>
          {!data?.matches.length ? <div className="py-16 px-6 text-center"><Clock3 className="w-9 h-9 mx-auto mb-4 text-muted-foreground" /><h3 className="font-semibold">{loading ? 'Carregando partidas' : 'Nenhuma partida neste filtro'}</h3><p className="text-sm text-muted-foreground mt-2">{loading ? '' : 'Tente outro período ou modalidade.'}</p></div> : <>
          <ul className="md:hidden divide-y divide-border">{data.matches.map(match => {
            const p = match.player;
            return <li key={match.id}><Link href={matchPath(match.id, match.shareKey)} className="flex items-center gap-3 px-4 py-3 active:bg-card/60">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2"><span className="font-semibold capitalize">{mapName(match.map)}</span><span className="text-xs text-muted-foreground truncate">{modeLabel(match.mode)}</span></div>
                <p className="text-xs text-muted-foreground mt-0.5">{date(match.playedAt)}</p>
                <p className="text-sm tabular-nums mt-1.5"><span className="text-muted-foreground">K/D/A</span> {p.kills}/{p.deaths}/{p.assists} <span className="text-muted-foreground ml-2">ADR</span> {adr(p)}</p>
              </div>
              <div className="text-right"><p className="font-semibold tabular-nums">{p.scoreFor}:{p.scoreAgainst}</p><p className={`text-xs font-medium ${resultColor(p.scoreFor, p.scoreAgainst)}`}>{resultLabel(p.scoreFor, p.scoreAgainst)}</p></div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link></li>;
          })}</ul>
          <table className="hidden md:table w-full text-sm"><thead className="text-muted-foreground bg-card/40"><tr>{['Mapa', 'Resultado', 'K / D / A', 'ADR', 'HS', ''].map((label, i) => <th key={i} className="px-4 py-3 text-left font-medium">{label}</th>)}</tr></thead><tbody>{data.matches.map(match => {
            const p = match.player, href = matchPath(match.id, match.shareKey);
            return <tr key={match.id} className="relative border-t border-border hover:bg-card/40"><td className="px-4 py-3"><Link href={href} className="font-semibold capitalize after:absolute after:inset-0">{mapName(match.map)}</Link><p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">{modeLabel(match.mode)} · {date(match.playedAt)}</p></td>
              <td className="px-4 py-3 whitespace-nowrap"><span className="font-semibold tabular-nums">{p.scoreFor} : {p.scoreAgainst}</span> <span className={`ml-2 font-medium ${resultColor(p.scoreFor, p.scoreAgainst)}`}>{resultLabel(p.scoreFor, p.scoreAgainst)}</span></td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">{p.kills} / {p.deaths} / {p.assists}</td><td className="px-4 py-3 tabular-nums">{adr(p)}</td><td className="px-4 py-3 tabular-nums">{hs(p)}</td>
              <td className="px-4 py-3 text-right text-muted-foreground"><ArrowRight className="w-4 h-4 inline" /></td></tr>;
          })}</tbody></table></>}
          {!!data?.total && data.total > 20 && <div className="flex items-center justify-between p-4 border-t border-border"><Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4 mr-1" />Anterior</Button><span className="text-xs text-muted-foreground">{page} de {Math.ceil(data.total / 20)}</span><Button variant="outline" size="sm" disabled={page * 20 >= data.total || loading} onClick={() => setPage(p => p + 1)}>Próxima<ChevronRight className="w-4 h-4 ml-1" /></Button></div>}
        </section>
        {status?.access && !status.groups.length && !loading && <p className="text-sm text-muted-foreground">Quer comparar com os amigos? <Link href="/grupos" className="text-primary underline-offset-4 hover:underline">Crie um grupo</Link> e mande o convite.</p>}
        {!!data?.comparison.length && <section className="rounded-xl border border-border p-4 md:p-5"><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-xl font-semibold flex items-center gap-2"><Users className="w-5 h-5 text-primary" />{status?.groups.find(g => g.id === group)?.name ?? 'Grupo'}</h2>{group && <Link href={`/grupos/${group}`} className="text-sm text-primary hover:underline">Ver grupo</Link>}</div><p className="text-sm text-muted-foreground mt-1">Mesmos filtros, para quem do grupo tem partida neles.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">{data.comparison.map(member => <div key={member.steamId} className="bg-card/50 rounded-lg p-4"><h3 className="font-semibold truncate"><Link href={`/perfil/${member.steamId}`} className="hover:text-primary">{member.username}</Link>{member.steamId === user?.steamId ? ' · você' : ''}</h3><p className="text-xs text-muted-foreground mt-1">{member.stats.matches} partidas</p><dl className="grid grid-cols-3 gap-2 mt-4">{[['K/D', number(member.stats.kd)], ['ADR', number(member.stats.adr)], ['Vitórias', number(member.stats.winRate, '%')]].map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="text-lg font-semibold mt-1">{value}</dd></div>)}</dl></div>)}</div>
        </section>}
        {!!status?.queue.length && <section className="rounded-xl border border-border p-4 md:p-5"><h2 className="font-semibold">Importando</h2><ul className="mt-4 space-y-3 text-sm">{status.queue.map(job => <li key={job.id} className="flex flex-wrap gap-2 justify-between border-b border-border pb-3"><span>Partida #{job.id} · {job.status === 'FAILED' ? 'Não importada' : job.status === 'PROCESSING' ? 'Processando' : 'Na fila'}</span><span className="text-muted-foreground">{job.lastError || 'A demo será baixada automaticamente.'}</span></li>)}</ul></section>}
      </>}
    </main>
  </div>;
}
