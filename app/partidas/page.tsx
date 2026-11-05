'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Activity, ArrowRight, BarChart3, ChevronLeft, ChevronRight, Clock3, Crosshair, ExternalLink, RefreshCw, Settings2, ShieldCheck, Trophy, Users } from 'lucide-react';
import { MatchScoreboard } from '@/components/match-scoreboard';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SteamLoginButton } from '@/components/auth/SteamLoginButton';
import { useAuth } from '@/contexts/AuthContext';
import { MatchDetail, MatchList, TrackingStatus, trackingApi } from '@/lib/services/tracking.service';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const number = (value: number | null | undefined, suffix = '') => value == null ? '—' : value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + suffix;
const date = (value: string) => new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
const mapName = (value: string) => value.replace(/^de_/, '').replace(/_/g, ' ');

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
  const [page, setPage] = useState(1);
  const [settings, setSettings] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const generation = useRef(0);

  const refresh = useCallback(async () => {
    const current = ++generation.current;
    if (!isAuthenticated) { setData(null); setStatus(null); return; }
    setLoading(true); setError('');
    try {
      const query = new URLSearchParams({ days, scope, page: String(page) });
      if (mode !== 'all') query.set('mode', mode);
      if (map) query.set('map', map);
      const [nextStatus, nextData] = await Promise.all([trackingApi.status(), trackingApi.list(query)]);
      if (current === generation.current) { setStatus(nextStatus); setData(nextData); }
    } catch (e) { if (current === generation.current) { setError((e as Error).message); setData(null); } }
    finally { if (current === generation.current) setLoading(false); }
  }, [isAuthenticated, user?.steamId, days, mode, map, scope, page]);

  useEffect(() => { void refresh(); return () => { generation.current++; }; }, [refresh]);
  useEffect(() => {
    if (!isAuthenticated) { setAuthCode(''); setShareCode(''); setDetail(null); setSelected(null); }
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
  useEffect(() => {
    let active = true;
    if (selected === null) return;
    setDetail(null); setDetailLoading(true);
    trackingApi.detail(selected).then(value => { if (active) setDetail(value); })
      .catch(e => { if (active) { setError(e.message); setSelected(null); } })
      .finally(() => { if (active) setDetailLoading(false); });
    return () => { active = false; };
  }, [selected]);

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
    <main className="container mx-auto max-w-7xl px-4 py-8 md:py-12 space-y-8">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div><p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Smokes Hub / Partidas</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-new-amsterdam)' }}>Cada partida conta.</h1>
          <p className="text-muted-foreground mt-3 max-w-xl">Seu histórico de Premier, Competitivo e Duplas, a evolução do grupo e os números por trás de cada vitória.</p></div>
        {!authLoading && isAuthenticated && <div className="flex gap-2"><Button variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Atualizar</Button>
          <Button onClick={() => setSettings(s => !s)}><Settings2 className="h-4 w-4 mr-2" />Rastreamento</Button></div>}
      </section>
      {authLoading ? <p role="status">Verificando sua sessão…</p> : !isAuthenticated ?
        <section className="rounded-xl border border-border bg-card/50 p-8 md:p-12 text-center space-y-5"><ShieldCheck className="h-10 w-10 text-primary mx-auto" /><h2 className="text-2xl font-bold">O ponto de encontro do trio</h2><p className="text-muted-foreground">Entre pela Steam para ver suas partidas. Esta área é exclusiva para o grupo.</p><div className="flex justify-center"><SteamLoginButton /></div></section> : <>
        {error && <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>}
        {message && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">{message}</p>}
        {status && <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-5 py-4">
          <div className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${status.tracking?.enabled && status.workerOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <div><p className="font-medium">{!status.tracking ? 'Conecte seu histórico' : !status.tracking.enabled ? 'Rastreamento pausado' : status.workerOnline ? 'Rastreamento automático ativo' : 'Aguardando o coletor'}</p>
              <p className="text-xs text-muted-foreground mt-1">{status.tracking?.lastError || (status.tracking?.lastCheckedAt ? `Última consulta: ${date(status.tracking.lastCheckedAt)}` : 'A primeira partida aparecerá após a configuração e o processamento.')}</p></div></div>
          <span className="text-xs text-muted-foreground flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Acesso privado do grupo</span>
        </section>}
        {status && (settings || !status.tracking) && <section className="rounded-xl border border-primary/30 bg-card/40 p-5 md:p-7">
          <h2 className="text-xl font-semibold">Conectar o histórico da Steam</h2><p className="text-sm text-muted-foreground mt-2 mb-5">Use seu código de autenticação de partidas e o código de uma partida recente. O login Steam já identifica sua conta; não precisamos da sua senha.</p>
          <a href="https://help.steampowered.com/en/wizard/HelpWithGameIssue/?appid=730&issueid=128" target="_blank" rel="noreferrer" className="text-sm text-primary inline-flex items-center gap-2 mb-6">Abrir acesso ao histórico na Steam <ExternalLink className="w-4 h-4" /></a>
          <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="tracking-auth">Código de autenticação</Label><Input id="tracking-auth" type="password" autoComplete="off" value={authCode} onChange={e => setAuthCode(e.target.value)} placeholder="AAAA-AAAAA-AAAA" required pattern="[A-Za-z0-9]{4}-[A-Za-z0-9]{5}-[A-Za-z0-9]{4}" maxLength={15} /></div>
            <div className="space-y-2"><Label htmlFor="tracking-match">Código da partida inicial</Label><Input id="tracking-match" autoComplete="off" value={shareCode} onChange={e => setShareCode(e.target.value)} placeholder="CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx" required pattern="CSGO-([A-Za-z0-9]{5}-){4}[A-Za-z0-9]{5}" maxLength={34} /></div>
            <div className="md:col-span-2 flex flex-wrap items-center gap-4"><Button disabled={busy || !status.serverConfigured} type="submit">{busy ? 'Salvando…' : 'Ativar rastreamento'}<ArrowRight className="w-4 h-4 ml-2" /></Button>
              {status.tracking && <Button variant="outline" type="button" disabled={busy} onClick={() => void disconnect()}>Desconectar histórico</Button>}
              <p className="text-xs text-muted-foreground">{status.serverConfigured ? 'O código é protegido no servidor. Desconectar mantém as partidas já importadas.' : 'A configuração do servidor ainda está pendente.'}</p></div>
          </form>
        </section>}
        <section aria-label="Filtros de partidas" className="flex flex-wrap gap-3 items-end">
          <div><Label htmlFor="period">Período</Label><select id="period" className="block bg-card border border-border rounded-md p-2 mt-2" value={days} onChange={e => { setDays(e.target.value); setPage(1); }}><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="0">Todo o histórico</option></select></div>
          <div><Label htmlFor="mode-filter">Modalidade</Label><select id="mode-filter" className="block bg-card border border-border rounded-md p-2 mt-2" value={mode} onChange={e => { setMode(e.target.value); setPage(1); }}><option value="all">Todas as modalidades</option><option value="competitive">Premier / Competitivo 5×5</option><option value="wingman">Duplas / Wingman 2×2</option></select></div>
          <div><Label htmlFor="map-filter">Mapa</Label><select id="map-filter" className="block bg-card border border-border rounded-md p-2 mt-2 capitalize" value={map} onChange={e => { setMap(e.target.value); setPage(1); }}><option value="">Todos os mapas</option>{data?.maps.map(m => <option key={m} value={m}>{mapName(m)}</option>)}</select></div>
          <div><Label htmlFor="group-filter">Jogadores</Label><select id="group-filter" className="block bg-card border border-border rounded-md p-2 mt-2" value={scope} onChange={e => { setScope(e.target.value); setPage(1); }}><option value="all">Minhas partidas</option><option value="together">Grupo no mesmo time</option></select></div>
          {loading && <p role="status" className="text-sm text-muted-foreground p-2">Carregando partidas…</p>}
        </section>
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">{cards.map(card => <div key={card.label} className="rounded-xl border border-border bg-card/50 p-5"><div className="flex justify-between text-muted-foreground text-sm"><span>{card.label}</span><card.icon className="w-4 h-4 text-primary" /></div><p className="text-3xl font-bold mt-3 tabular-nums">{card.value}</p><p className="text-xs text-muted-foreground mt-2">{card.note}</p></div>)}</section>
        {!!data?.evolution.length && <section className="rounded-xl border border-border p-5"><h2 className="text-xl font-semibold">Sua evolução</h2><p className="text-sm text-muted-foreground mt-2">ADR nas últimas 30 partidas do filtro, da mais antiga para a mais recente.</p><div className="h-52 mt-6" role="img" aria-label="Gráfico do dano médio por round em cada partida"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.evolution}><CartesianGrid stroke="#333" strokeDasharray="3 3" /><XAxis dataKey="id" tickFormatter={(id: number) => `#${id}`} tick={{ fill: '#aaa', fontSize: 11 }} /><YAxis tick={{ fill: '#aaa', fontSize: 11 }} width={35} /><Tooltip contentStyle={{ background: '#202020', borderColor: '#444', borderRadius: 8 }} labelFormatter={(_label, payload) => payload?.[0]?.payload?.playedAt ? date(payload[0].payload.playedAt) : 'Partida'} /><Line type="linear" dataKey="adr" name="ADR" stroke="#bf6fff" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} /></LineChart></ResponsiveContainer></div></section>}
        <section className="rounded-xl border border-border overflow-hidden"><div className="p-5 flex justify-between items-center border-b border-border"><h2 className="text-xl font-semibold">Histórico de partidas</h2><span className="text-sm text-muted-foreground">{data?.total ?? 0} partidas</span></div>
          {!data?.matches.length ? <div className="py-16 px-6 text-center"><Clock3 className="w-9 h-9 mx-auto mb-4 text-muted-foreground" /><h3 className="font-semibold">{loading ? 'Buscando seu histórico' : 'Nenhuma partida neste filtro'}</h3><p className="text-sm text-muted-foreground mt-2">{status?.tracking ? 'As partidas aparecem aqui quando as demos forem processadas. Experimente também outro período.' : 'Conecte o histórico para começar a acompanhar seus resultados.'}</p></div> :
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-muted-foreground bg-card/40"><tr>{['Mapa / data', 'Resultado', 'Placar', 'K / D / A', 'ADR', 'HS%', ''].map((label, i) => <th key={i} className="p-4 text-left font-medium">{label}</th>)}</tr></thead><tbody>{data.matches.map(match => {
            const p = match.player, win = p.scoreFor > p.scoreAgainst, draw = p.scoreFor === p.scoreAgainst;
            return <tr key={match.id} className="border-t border-border hover:bg-card/40"><td className="p-4"><p className="font-semibold capitalize">{mapName(match.map)}</p><p className="text-xs text-primary mt-1">{match.mode === 'wingman' ? 'Duplas · 2×2' : 'Premier / Competitivo · 5×5'}</p><p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">{date(match.playedAt)}</p></td><td className={`p-4 font-medium ${draw ? 'text-amber-300' : win ? 'text-emerald-400' : 'text-red-400'}`}>{draw ? 'Empate' : win ? 'Vitória' : 'Derrota'}</td><td className="p-4 whitespace-nowrap tabular-nums font-semibold">{p.scoreFor} : {p.scoreAgainst}</td><td className="p-4 whitespace-nowrap tabular-nums">{p.kills} / {p.deaths} / {p.assists}</td><td className="p-4">{number(p.damage == null || !p.rounds ? null : p.damage / p.rounds)}</td><td className="p-4">{number(p.headshots == null || !p.kills ? null : p.headshots / p.kills * 100, '%')}</td><td className="p-4"><Button variant="ghost" size="sm" onClick={() => setSelected(match.id)}>Placar<ArrowRight className="w-4 h-4 ml-2" /></Button></td></tr>;
          })}</tbody></table></div>}
          {!!data?.total && <div className="flex items-center justify-between p-4 border-t border-border"><Button variant="outline" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4 mr-1" />Anterior</Button><span className="text-xs text-muted-foreground">Página {page} de {Math.ceil(data.total / 20)}</span><Button variant="outline" disabled={page * 20 >= data.total || loading} onClick={() => setPage(p => p + 1)}>Próxima<ChevronRight className="w-4 h-4 ml-1" /></Button></div>}
        </section>
        <section className="rounded-xl border border-border p-5"><h2 className="text-xl font-semibold flex items-center gap-2"><Users className="w-5 h-5 text-primary" />O grupo em números</h2><p className="text-sm text-muted-foreground mt-2">Mesmo período, modalidade e mapa. Apenas membros com rastreamento ativado aparecem na comparação.</p>
          {!data?.comparison.length ? <p className="text-sm text-muted-foreground py-8">A comparação fica disponível quando o grupo conectar o histórico.</p> : <div className="grid md:grid-cols-3 gap-4 mt-6">{data.comparison.map(member => <div key={member.steamId} className="bg-card/50 rounded-lg p-5"><h3 className="font-semibold truncate">{member.username}{member.steamId === user?.steamId ? ' · você' : ''}</h3><p className="text-xs text-muted-foreground mt-1">{member.stats.matches} partidas</p><dl className="grid grid-cols-3 gap-2 mt-5">{[['K/D', number(member.stats.kd)], ['ADR', number(member.stats.adr)], ['Vitórias', number(member.stats.winRate, '%')]].map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="text-lg font-semibold mt-1">{value}</dd></div>)}</dl></div>)}</div>}
        </section>
        {!!status?.queue.length && <section className="rounded-xl border border-border p-5"><h2 className="font-semibold">Fila de importação</h2><ul className="mt-4 space-y-3 text-sm">{status.queue.map(job => <li key={job.id} className="flex flex-wrap gap-2 justify-between border-b border-border pb-3"><span>Partida #{job.id} · {job.status === 'FAILED' ? 'Não importada' : job.status === 'PROCESSING' ? 'Processando' : 'Aguardando'}</span><span className="text-muted-foreground">{job.lastError || 'O coletor buscará a demo automaticamente.'}</span></li>)}</ul></section>}
        <p className="text-xs text-muted-foreground">Estatísticas calculadas somente sobre partidas importadas. ADR usa dano total / rounds; HS% usa eliminações com headshot / eliminações. “—” indica dado indisponível ou divisão por zero.</p>
      </>}
    </main>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="w-[96vw] sm:max-w-7xl max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle className="capitalize">{detail ? mapName(detail.map) : 'Placar da partida'}</DialogTitle><DialogDescription>{detail ? `${date(detail.playedAt)} · ${detail.mode === 'wingman' ? 'Duplas 2×2' : '5×5'} · ${detail.rounds} rounds` : 'Carregando o resultado da partida.'}</DialogDescription></DialogHeader>
      {detailLoading ? <p role="status" className="py-10 text-center">Carregando…</p> : detail && <MatchScoreboard match={detail} viewer={user?.steamId} />}
    </DialogContent></Dialog>
  </div>;
}
