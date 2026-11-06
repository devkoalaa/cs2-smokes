'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Copy, Crown, Plus, Trash2 } from 'lucide-react';
import { Alert, LoginPrompt, UserAvatar, useCopy } from '@/components/hub-ui';
import { GroupTile, PageHeader, Panel } from '@/components/kit';
import { rise } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/match';
import { AdminOverview, groupsApi, TrackingStatus, trackingApi } from '@/lib/services/tracking.service';

const inviteUrl = (code: string) => `${window.location.origin}/convite/${code}`;

export default function GroupsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<TrackingStatus | null>(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => { if (isAuthenticated) trackingApi.status().then(setStatus).catch(e => setError(e.message)); }, [isAuthenticated]);
  useEffect(load, [load]);

  async function create(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { router.push(`/grupos/${(await groupsApi.create(name.trim())).id}`); }
    catch (e) { setError((e as Error).message); setBusy(false); }
  }

  return <>
      <PageHeader title="Grupos" subtitle="No grupo, cada um vê o ranking, o perfil e as partidas que vocês jogaram juntos. Quem não está no grupo não vê nada disso." />
      {isLoading ? <p role="status">Verificando sua sessão…</p> : !isAuthenticated ? <LoginPrompt text="Entre com a Steam para ver seus grupos." />
      : error ? <Alert>{error}</Alert> : !status ? <p role="status" className="text-muted-foreground">Carregando…</p>
      : !status.access ? <Panel className="space-y-2 p-8 text-center">
          <h2 className="font-display text-3xl">Beta fechado</h2>
          <p className="text-muted-foreground">Os grupos ficam liberados quando você entra pelo link de convite de alguém que já usa o CS2 Hub.</p></Panel>
      : <>
        <section className="grid gap-3 sm:grid-cols-2">
          {status.groups.map((g, i) => <Link key={g.id} href={`/grupos/${g.id}`} style={rise(i + 1)} className="group flex items-center gap-4 rounded-xl bg-card p-4 ring-1 ring-white/[0.06] transition hover:-translate-y-0.5 hover:ring-white/15">
            <GroupTile id={g.id} name={g.name} src={g.avatarUrl} className="h-12 w-12 text-sm" />
            <span className="min-w-0 flex-1"><span className="flex items-center gap-2 font-semibold truncate">{g.name}{g.owner && <Crown className="h-3.5 w-3.5 text-draw" aria-label="Você criou" />}</span>
              <span className="text-sm text-muted-foreground">{g.members} {g.members === 1 ? 'pessoa' : 'pessoas'}</span></span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" /></Link>)}
          <form onSubmit={create} className="space-y-3 rounded-xl border border-dashed border-white/15 p-4" style={rise(status.groups.length + 1)}>
            <label htmlFor="group-name" className="font-semibold flex items-center gap-2"><Plus className="h-4 w-4" />Criar grupo</label>
            <div className="flex gap-2"><Input id="group-name" value={name} onChange={e => setName(e.target.value)} placeholder="Nome do grupo" minLength={2} maxLength={40} required />
              <Button type="submit" disabled={busy || name.trim().length < 2}>Criar</Button></div>
            <p className="text-xs text-muted-foreground">Depois é só mandar o link de convite para a galera.</p>
          </form>
        </section>
        {status.admin && <AdminPanel />}
      </>}
    </>;
}

function AdminPanel() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [uses, setUses] = useState(1);
  const [error, setError] = useState('');
  const { copied, copy } = useCopy();
  const load = useCallback(() => { groupsApi.admin().then(setData).catch(e => setError(e.message)); }, []);
  useEffect(load, [load]);
  const run = (action: () => Promise<unknown>) => action().then(load).catch(e => setError(e.message));

  return <section className="space-y-5 rounded-xl bg-card p-4 ring-1 ring-highlight/30 md:p-5">
    <div><h2 className="text-xl font-semibold">Beta · administração</h2>
      {data && <p className="text-sm text-muted-foreground mt-1">{data.seats.used} de {data.seats.max} vagas ocupadas. Convites de grupo também ocupam vaga quando trazem alguém novo.</p>}</div>
    {error && <Alert>{error}</Alert>}
    <div className="space-y-3">
      <h3 className="font-semibold">Convites de acesso</h3>
      <p className="text-sm text-muted-foreground">Para quem quer usar sozinho, sem entrar num grupo.</p>
      <div className="flex flex-wrap items-center gap-2"><label htmlFor="uses" className="text-sm">Usos</label>
        <Input id="uses" type="number" min={1} max={20} value={uses} onChange={e => setUses(Number(e.target.value))} className="w-20" />
        <Button size="sm" onClick={() => run(() => groupsApi.createAccessInvite(uses))}>Gerar link</Button></div>
      <ul className="divide-y divide-border rounded-lg bg-black/20 text-sm ring-1 ring-white/[0.06]">
        {!data?.invites.length && <li className="p-3 text-muted-foreground">Nenhum convite de acesso.</li>}
        {data?.invites.map(i => <li key={i.code} className="flex flex-wrap items-center gap-2 p-3">
          <code className="flex-1 truncate">{`/convite/${i.code}`}</code>
          <span className="text-muted-foreground">{i.usesLeft === 0 ? 'usado' : `${i.usesLeft} ${i.usesLeft === 1 ? 'uso' : 'usos'}`}</span>
          <Button size="sm" variant="outline" onClick={() => copy(inviteUrl(i.code), i.code)}><Copy className="h-3.5 w-3.5 mr-1.5" />{copied === i.code ? 'Copiado' : 'Copiar'}</Button>
          <Button size="sm" variant="ghost" aria-label="Apagar convite" onClick={() => run(() => groupsApi.deleteAccessInvite(i.code))}><Trash2 className="h-4 w-4" /></Button>
        </li>)}
      </ul>
    </div>
    <div className="space-y-3">
      <h3 className="font-semibold">Quem tem acesso</h3>
      <ul className="divide-y divide-border rounded-lg bg-black/20 text-sm ring-1 ring-white/[0.06]">
        {data?.users.map(u => <li key={u.id} className="flex items-center gap-3 p-3">
          <UserAvatar src={u.avatarUrl} name={u.username} className="h-8 w-8" />
          <span className="min-w-0 flex-1"><span className="block truncate font-medium">{u.username}{data.founders.includes(u.steamId) ? ' · fundador' : ''}</span>
            <span className="text-xs text-muted-foreground">desde {formatDate(u.accessGrantedAt)} · {u.importing ? 'importando' : 'sem importação'} · {u.groups} {u.groups === 1 ? 'grupo' : 'grupos'}</span></span>
          {!data.founders.includes(u.steamId) && <Button size="sm" variant="danger-ghost" onClick={() => {
            if (confirm(`Tirar o acesso de ${u.username}? A importação dele é desligada e a vaga fica livre.`)) run(() => groupsApi.revokeAccess(u.id));
          }}>Tirar acesso</Button>}
        </li>)}
      </ul>
    </div>
  </section>;
}
