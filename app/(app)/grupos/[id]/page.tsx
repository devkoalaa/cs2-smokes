'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Camera, Check, Copy, Crown, Loader2, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { Alert, LoginPrompt, PeriodSelect, UserAvatar, useCopy } from '@/components/hub-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { formatNumber } from '@/lib/match';
import { GroupTile, MatchArtCard, Panel } from '@/components/kit';
import { ImageUpload, notifyGroupsChanged } from '@/components/image-upload';
import { rise } from '@/lib/motion';
import { GroupDetail, groupsApi } from '@/lib/services/tracking.service';
import { GroupSkeleton } from '@/components/skeletons';

type Together = GroupDetail['together'][number];

type Sort = 'rating' | 'kd' | 'adr' | 'hsPercent' | 'winRate' | 'matches';
const COLUMNS: [Sort, string][] = [['rating', 'Rating'], ['kd', 'K/D'], ['adr', 'ADR'], ['hsPercent', 'HS'], ['winRate', 'Vitórias'], ['matches', 'Partidas']];
const show = (key: Sort, v: number | null) => key === 'rating' ? (v == null ? '—' : v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
  : formatNumber(key === 'hsPercent' || key === 'winRate' ? (v == null ? null : Math.round(v)) : v, key === 'hsPercent' || key === 'winRate' ? '%' : '');

export default function GroupPage() {
  const id = Number(useParams<{ id: string }>().id);
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
    await run(() => groupsApi.rename(id, name.trim()), () => { setEditing(false); load(); notifyGroupsChanged(); });
  }

  const ranked = group ? [...group.members].sort((a, b) => (b.stats.matches ? 1 : 0) - (a.stats.matches ? 1 : 0)
    || ((b.stats[sort] as number | null) ?? -1) - ((a.stats[sort] as number | null) ?? -1)) : [];
  const medals = ['🥇', '🥈', '🥉'];
  const invite = group?.invite ? `${typeof window === 'undefined' ? '' : window.location.origin}/convite/${group.invite}` : null;

  return <>
      <nav aria-label="Caminho" className="text-sm text-muted-foreground"><Link href="/grupos" className="hover:text-foreground">Grupos</Link>{group && <><span className="mx-1.5 text-zinc-600">/</span><span className="text-foreground">{group.name}</span></>}</nav>
      {isLoading ? <GroupSkeleton /> : !isAuthenticated ? <LoginPrompt text="Entre com a Steam para ver o grupo." />
      : error && !group ? <Alert>{error}</Alert> : !group ? <GroupSkeleton /> : <>
        <section className="flex flex-wrap items-center justify-between gap-4" style={rise(0)}>
          <div className="flex min-w-0 items-center gap-4"><div className="relative shrink-0">
            <GroupTile id={group.id} name={group.name} src={group.avatarUrl} className="h-16 w-16 text-xl md:h-20 md:w-20" />
            {group.owner && <ImageUpload label="Trocar a foto do grupo" upload={file => groupsApi.uploadGroupAvatar(id, file)}
              onDone={() => { load(); notifyGroupsChanged(); }} onError={setError}
              className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition hover:brightness-110 disabled:opacity-70">
              {busy => busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}</ImageUpload>}
          </div><div className="min-w-0">
            {editing ? <form onSubmit={rename} className="flex gap-2"><Input aria-label="Nome do grupo" value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={40} autoFocus />
              <Button type="submit" size="sm" disabled={name.trim().length < 2}>Salvar</Button><Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button></form>
            : <h1 className="font-display text-4xl leading-none break-words md:text-5xl">{group.name}</h1>}
            {/* Ações do dono ficam na linha de baixo: um ícone colado no nome quebrava sozinho em nome longo. */}
            <p className="text-sm text-muted-foreground mt-2">{group.members.length} de {group.limits.membersPerGroup} pessoas
              {group.owner && !editing && <> · <button type="button" className="hover:text-foreground hover:underline"
                onClick={() => setEditing(true)}><Pencil className="mr-1 inline h-3.5 w-3.5 -translate-y-px" />renomear</button></>}
              {group.owner && group.avatarUrl && <> · <button type="button" className="hover:text-foreground hover:underline"
                onClick={() => run(() => groupsApi.removeGroupAvatar(id), () => { load(); notifyGroupsChanged(); })}>tirar a foto</button></>}</p>
          </div></div>
          <PeriodSelect value={days} onChange={setDays} />
        </section>
        {error && <Alert>{error}</Alert>}

        <section className="overflow-hidden rounded-xl bg-card ring-1 ring-white/[0.06]" style={rise(1)}>
          <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b border-border"><h2 className="text-lg font-bold">Ranking</h2>
            <label className="text-sm text-muted-foreground flex items-center gap-2">Ordenar por
              <select className="bg-card border border-border rounded-md px-2 py-1.5 text-foreground" value={sort} onChange={e => setSort(e.target.value as Sort)}>
                {COLUMNS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>
          <ul className="divide-y divide-border">{ranked.map((m, i) => <li key={m.id} className="flex items-center hover:bg-card/60">
            <Link href={`/perfil/${m.steamId}`} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
              <span className="w-7 text-center text-lg">{m.stats.matches ? medals[i] ?? <span className="text-sm text-muted-foreground">{i + 1}</span> : ''}</span>
              <UserAvatar src={m.avatarUrl} name={m.username} />
              <span className="min-w-0 flex-1">
                <span className={`flex items-center gap-1.5 font-semibold truncate ${m.steamId === user?.steamId ? 'text-primary' : ''}`}>{m.username}{m.owner && <Crown className="h-3.5 w-3.5 text-draw shrink-0" aria-label="Criou o grupo" />}</span>
                {m.stats.matches ? <span className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground tabular-nums mt-0.5">
                  {COLUMNS.map(([key, label]) => <span key={key} className={`whitespace-nowrap ${key === sort ? 'text-foreground font-semibold' : ''}`}>{label} {show(key, m.stats[key] as number | null)}</span>)}</span>
                : <span className="text-xs text-muted-foreground">Sem partidas no período</span>}
              </span>
            </Link>
            {group.owner && m.id !== group.ownerId && <Button size="icon" variant="danger-ghost" className="mr-3 shrink-0" aria-label={`Tirar ${m.username} do grupo`} title="Tirar do grupo" onClick={() => {
              if (confirm(`Tirar ${m.username} do grupo?`)) run(() => groupsApi.removeMember(id, m.id)); }}><Trash2 className="h-4 w-4" /></Button>}
          </li>)}</ul>
        </section>

        <section className="space-y-3">
          <div><h2 className="text-lg font-bold">Jogaram juntos</h2>
            <p className="mt-1 text-sm text-muted-foreground">Partidas com pelo menos dois do grupo no mesmo time. O número colorido é o Rating.</p></div>
          {!group.together.length ? <Panel className="p-6 text-sm text-muted-foreground">Nenhuma partida juntos no período.</Panel>
          : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{group.together.map((m, i) =>
              <MatchArtCard key={`${m.id}-${m.player.steamId}`} i={i + 2} href={m.viewerPlayed ? `/partidas/${m.id}` : undefined} cta="Ver partida"
                map={m.map} mode={m.mode} playedAt={m.playedAt} scoreFor={m.scoreFor} scoreAgainst={m.scoreAgainst}>
                <PlayerChips players={m.players} avatars={Object.fromEntries(group.members.map(u => [u.steamId, u.avatarUrl]))} me={user?.steamId} />
              </MatchArtCard>)}</div>}
        </section>

        <section className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-white/[0.06] md:p-5">
          <h2 className="text-lg font-bold">Convidar</h2>
          <p className="text-sm text-muted-foreground">Quem abrir o link entra no grupo. Se a pessoa ainda não usa o CS2 Hub, o convite também libera o acesso dela (enquanto houver vagas no beta).</p>
          {invite && <div className="flex flex-wrap gap-2"><code className="flex-1 min-w-0 truncate rounded-lg border border-border bg-input px-3 py-2 text-sm">{invite}</code>
            <Button onClick={() => copy(invite)}>{copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}{copied ? 'Copiado' : 'Copiar link'}</Button>
            {group.owner && <Button variant="outline" onClick={() => { if (confirm('Gerar um link novo? O atual para de funcionar.')) run(() => groupsApi.rotateInvite(id)); }}>
              <RefreshCw className="h-4 w-4 mr-2" />Trocar link</Button>}</div>}
        </section>

        <section className="flex flex-wrap gap-3">
          {group.owner ? <Button variant="danger" onClick={() => {
            if (confirm(`Apagar o grupo "${group.name}"? Ninguém perde partidas, só o grupo some.`)) run(() => groupsApi.remove(id), () => router.push('/grupos'));
          }}>Apagar grupo</Button>
          : <Button variant="outline" onClick={() => { if (confirm('Sair do grupo?')) run(() => groupsApi.removeMember(id, group.members.find(m => m.steamId === user?.steamId)!.id), () => router.push('/grupos')); }}>Sair do grupo</Button>}
        </section>
      </>}
    </>;
}

// Cada um do grupo numa pastilha com avatar, K/D/A e o Rating colorido.
const ratingColor = (r: number | null) => r == null ? 'text-muted-foreground' : r >= 1.1 ? 'text-win' : r < 0.9 ? 'text-loss' : 'text-foreground';
function PlayerChips({ players, avatars, me }: { players: Together['players']; avatars: Record<string, string | null>; me?: string }) {
  return <div className="flex flex-wrap gap-1.5">{[...players].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).map(p => <span key={p.steamId}
    className={`inline-flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2.5 text-xs tabular-nums ${p.steamId === me ? 'border-primary/50 bg-primary/10' : 'border-border bg-black/20'}`}>
    <UserAvatar src={avatars[p.steamId]} name={p.name} className="h-5 w-5" />
    <span className="font-medium">{p.name}</span>
    <span className="text-muted-foreground">{p.kills}/{p.deaths}/{p.assists}</span>
    <span className={`font-semibold ${ratingColor(p.rating)}`}>{p.rating == null ? '—' : p.rating.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
  </span>)}</div>;
}
