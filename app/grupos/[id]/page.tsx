'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, ChevronRight, Copy, Crown, Pencil, RefreshCw } from 'lucide-react';
import { Header } from '@/components/header';
import { Alert, LoginPrompt, PeriodSelect, UserAvatar, useCopy } from '@/components/hub-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { formatNumber, mapName, resultLabel } from '@/lib/match';
import { GroupDetail, groupsApi } from '@/lib/services/tracking.service';

type Together = GroupDetail['together'][number];

type Sort = 'rating' | 'kd' | 'adr' | 'hsPercent' | 'winRate' | 'matches';
const COLUMNS: [Sort, string][] = [['rating', 'Rating'], ['kd', 'K/D'], ['adr', 'ADR'], ['hsPercent', 'HS'], ['winRate', 'Vitórias'], ['matches', 'Partidas']];
const show = (key: Sort, v: number | null) => key === 'rating' ? (v == null ? '—' : v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
  : formatNumber(key === 'hsPercent' || key === 'winRate' ? (v == null ? null : Math.round(v)) : v, key === 'hsPercent' || key === 'winRate' ? '%' : '');

export default function GroupPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [days, setDays] = useState(30);
  const [sort, setSort] = useState<Sort>('rating');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const { copied, copy } = useCopy();

  const load = useCallback(() => {
    if (!isAuthenticated || !Number.isInteger(id)) return;
    groupsApi.get(id, days).then(g => { setGroup(g); setName(g.name); setError(''); }).catch(e => setError(e.message));
  }, [isAuthenticated, id, days]);
  useEffect(load, [load]);
  const run = (action: () => Promise<unknown>, after: () => void = load) => action().then(after).catch(e => setError(e.message));

  async function rename(event: FormEvent) {
    event.preventDefault();
    await run(() => groupsApi.rename(id, name.trim()), () => { setEditing(false); load(); });
  }

  const ranked = group ? [...group.members].sort((a, b) => (b.stats.matches ? 1 : 0) - (a.stats.matches ? 1 : 0)
    || ((b.stats[sort] as number | null) ?? -1) - ((a.stats[sort] as number | null) ?? -1)) : [];
  const medals = ['🥇', '🥈', '🥉'];
  const invite = group?.invite ? `${typeof window === 'undefined' ? '' : window.location.origin}/convite/${group.invite}` : null;

  return <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto max-w-6xl px-4 py-6 md:py-10 space-y-6">
      <Link href="/grupos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Grupos</Link>
      {isLoading ? <p role="status">Verificando sua sessão…</p> : !isAuthenticated ? <LoginPrompt text="Entre com a Steam para ver o grupo." />
      : error && !group ? <Alert>{error}</Alert> : !group ? <p role="status" className="text-muted-foreground">Carregando o grupo…</p> : <>
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            {editing ? <form onSubmit={rename} className="flex gap-2"><Input aria-label="Nome do grupo" value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={40} autoFocus />
              <Button type="submit" size="sm" disabled={name.trim().length < 2}>Salvar</Button><Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button></form>
            : <h1 className="text-4xl md:text-6xl font-bold leading-none break-words" style={{ fontFamily: 'var(--font-new-amsterdam)' }}>{group.name}
                {group.owner && <button type="button" aria-label="Renomear" onClick={() => setEditing(true)} className="ml-3 align-middle text-muted-foreground hover:text-foreground"><Pencil className="inline h-5 w-5" /></button>}</h1>}
            <p className="text-sm text-muted-foreground mt-2">{group.members.length} de {group.limits.membersPerGroup} pessoas</p>
          </div>
          <PeriodSelect value={days} onChange={setDays} />
        </section>
        {error && <Alert>{error}</Alert>}

        <section className="rounded-xl border border-border overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b border-border"><h2 className="text-xl font-semibold">Ranking</h2>
            <label className="text-sm text-muted-foreground flex items-center gap-2">Ordenar por
              <select className="bg-card border border-border rounded-md px-2 py-1.5 text-foreground" value={sort} onChange={e => setSort(e.target.value as Sort)}>
                {COLUMNS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>
          <ul className="divide-y divide-border">{ranked.map((m, i) => <li key={m.id} className="flex items-center hover:bg-card/60">
            <Link href={`/perfil/${m.steamId}`} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
              <span className="w-7 text-center text-lg">{m.stats.matches ? medals[i] ?? <span className="text-sm text-muted-foreground">{i + 1}</span> : ''}</span>
              <UserAvatar src={m.avatarUrl} name={m.username} />
              <span className="min-w-0 flex-1">
                <span className={`flex items-center gap-1.5 font-semibold truncate ${m.steamId === user?.steamId ? 'text-primary' : ''}`}>{m.username}{m.owner && <Crown className="h-3.5 w-3.5 text-amber-300 shrink-0" aria-label="Criou o grupo" />}</span>
                {m.stats.matches ? <span className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground tabular-nums mt-0.5">
                  {COLUMNS.map(([key, label]) => <span key={key} className={`whitespace-nowrap ${key === sort ? 'text-foreground font-semibold' : ''}`}>{label} {show(key, m.stats[key] as number | null)}</span>)}</span>
                : <span className="text-xs text-muted-foreground">Sem partidas no período</span>}
              </span>
            </Link>
            {group.owner && m.id !== group.ownerId && <Button size="sm" variant="ghost" className="mr-3 text-red-300" onClick={() => {
              if (confirm(`Tirar ${m.username} do grupo?`)) run(() => groupsApi.removeMember(id, m.id)); }}>Tirar</Button>}
          </li>)}</ul>
        </section>

        <section className="rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border"><h2 className="text-xl font-semibold">Jogaram juntos</h2>
            <p className="text-sm text-muted-foreground mt-1">Partidas com pelo menos dois do grupo no mesmo time. O número colorido é o Rating.</p></div>
          {!group.together.length ? <p className="p-4 text-sm text-muted-foreground">Nenhuma partida juntos no período.</p>
          : <ul className="divide-y divide-border">{group.together.map(m => <li key={`${m.id}-${m.player.steamId}`}>
              <TogetherRow match={m} avatars={Object.fromEntries(group.members.map(u => [u.steamId, u.avatarUrl]))} me={user?.steamId} /></li>)}</ul>}
        </section>

        <section className="rounded-xl border border-border p-4 md:p-5 space-y-3">
          <h2 className="text-xl font-semibold">Convidar</h2>
          <p className="text-sm text-muted-foreground">Quem abrir o link entra no grupo. Se a pessoa ainda não usa o CS2 Hub, o convite também libera o acesso dela (enquanto houver vagas no beta).</p>
          {invite && <div className="flex flex-wrap gap-2"><code className="flex-1 min-w-0 truncate rounded-md border border-border bg-card px-3 py-2 text-sm">{invite}</code>
            <Button onClick={() => copy(invite)}>{copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}{copied ? 'Copiado' : 'Copiar link'}</Button>
            {group.owner && <Button variant="outline" onClick={() => { if (confirm('Gerar um link novo? O atual para de funcionar.')) run(() => groupsApi.rotateInvite(id)); }}>
              <RefreshCw className="h-4 w-4 mr-2" />Trocar link</Button>}</div>}
        </section>

        <section className="flex flex-wrap gap-3">
          {group.owner ? <Button variant="outline" className="text-red-300 border-red-500/40" onClick={() => {
            if (confirm(`Apagar o grupo "${group.name}"? Ninguém perde partidas, só o grupo some.`)) run(() => groupsApi.remove(id), () => router.push('/grupos'));
          }}>Apagar grupo</Button>
          : <Button variant="outline" onClick={() => { if (confirm('Sair do grupo?')) run(() => groupsApi.removeMember(id, group.members.find(m => m.steamId === user?.steamId)!.id), () => router.push('/grupos')); }}>Sair do grupo</Button>}
        </section>
      </>}
    </main>
  </div>;
}

// Uma partida do grupo: faixa com o resultado, mapa e data numa linha, e cada um do
// grupo numa pastilha com K/D/A e o Rating colorido.
const ratingColor = (r: number | null) => r == null ? 'text-muted-foreground' : r >= 1.1 ? 'text-emerald-400' : r < 0.9 ? 'text-red-400' : 'text-foreground';
function TogetherRow({ match: m, avatars, me }: { match: Together; avatars: Record<string, string | null>; me?: string }) {
  const result = resultLabel(m.scoreFor, m.scoreAgainst);
  const bar = result === 'Vitória' ? 'bg-emerald-400' : result === 'Derrota' ? 'bg-red-400' : 'bg-amber-300';
  const date = new Date(m.playedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '');
  const players = [...m.players].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  const body = <>
    <span className={`w-1 self-stretch rounded-full ${bar}`} aria-hidden />
    <div className="min-w-0 flex-1 space-y-2">
      <p className="text-sm"><span className="font-semibold capitalize">{mapName(m.map)}</span>
        <span className="text-muted-foreground"> · {date} · {m.mode === 'wingman' ? '2×2' : '5×5'}</span></p>
      <div className="flex flex-wrap gap-1.5">{players.map(p => <span key={p.steamId}
        className={`inline-flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2.5 text-xs tabular-nums ${p.steamId === me ? 'border-primary/50 bg-primary/10' : 'border-border bg-card/60'}`}>
        <UserAvatar src={avatars[p.steamId]} name={p.name} className="h-5 w-5" />
        <span className="font-medium">{p.name}</span>
        <span className="text-muted-foreground">{p.kills}/{p.deaths}/{p.assists}</span>
        <span className={`font-semibold ${ratingColor(p.rating)}`}>{p.rating == null ? '—' : p.rating.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </span>)}</div>
    </div>
    <div className="text-right shrink-0"><p className="font-semibold tabular-nums">{m.scoreFor}:{m.scoreAgainst}</p>
      <p className="text-xs text-muted-foreground">{result}</p></div>
  </>;
  return m.viewerPlayed
    ? <Link href={`/partidas/${m.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-card/60">{body}<ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" /></Link>
    : <div className="flex items-center gap-3 px-4 py-3">{body}<span className="w-4 shrink-0" /></div>;
}
