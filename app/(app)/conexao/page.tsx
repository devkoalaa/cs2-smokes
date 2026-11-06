'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, CircleAlert, CirclePause, ExternalLink, KeyRound, ListOrdered, Loader2 } from 'lucide-react';
import { Alert, LoginPrompt } from '@/components/hub-ui';
import { PageHeader, Panel, PanelTitle, Pill } from '@/components/kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate as date } from '@/lib/match';
import { rise } from '@/lib/motion';
import { TrackingStatus, trackingApi } from '@/lib/services/tracking.service';

const STEAM_CODES = 'https://help.steampowered.com/en/wizard/HelpWithGameIssue/?appid=730&issueid=128';

const STEPS = [
  { icon: KeyRound, title: 'Abra a página da Steam', text: <>Em <a href={STEAM_CODES} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">Ajuda da Steam → CS2 <ExternalLink className="h-3.5 w-3.5" /></a>, crie o código de autenticação.</> },
  { icon: ListOrdered, title: 'Copie os dois códigos', text: 'O de autenticação e o da sua partida mais recente (o "CSGO-…" na mesma página).' },
  { icon: CheckCircle2, title: 'Cole aqui e salve', text: 'A partir dessa partida, as próximas entram sozinhas.' },
];

// Conexão com a Steam: os dois códigos que deixam o coletor importar as partidas
// sozinho, o estado da importação e a fila do que está entrando agora.
export default function ConnectionPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [status, setStatus] = useState<TrackingStatus | null>(null);
  const [authCode, setAuthCode] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(() => {
    if (isAuthenticated) trackingApi.status().then(setStatus).catch(e => setError(e.message));
  }, [isAuthenticated]);
  useEffect(() => {
    load();
    const timer = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 30000);
    return () => clearInterval(timer);
  }, [load]);

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      setMessage((await trackingApi.configure(authCode.trim(), shareCode.trim())).message);
      setAuthCode(''); setShareCode(''); load();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function disconnect() {
    if (!confirm('Desligar a importação automática? As partidas já importadas continuam.')) return;
    setBusy(true); setError(''); setMessage('');
    try { setMessage((await trackingApi.disconnect()).message); load(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }

  const t = status?.tracking;
  const state = !t ? { icon: CirclePause, tone: 'text-muted-foreground', title: 'Importação desligada', text: 'Suas partidas só entram quando alguém do grupo que jogou com você tem a importação ligada.' }
    : t.lastError ? { icon: CircleAlert, tone: 'text-loss', title: 'A importação parou', text: t.lastError }
    : !t.enabled ? { icon: CirclePause, tone: 'text-draw', title: 'Importação pausada', text: 'Salve os códigos de novo para retomar.' }
    : !status?.workerOnline ? { icon: CircleAlert, tone: 'text-draw', title: 'Importação ligada, coletor fora do ar', text: 'As partidas novas entram assim que o coletor voltar. Não precisa fazer nada.' }
    : { icon: CheckCircle2, tone: 'text-win', title: 'Importação automática ligada', text: t.lastCheckedAt ? `Última busca em ${date(t.lastCheckedAt)}. As partidas novas aparecem sozinhas em Partidas.` : 'A primeira busca acontece em instantes.' };

  return <>
    <PageHeader title="Conexão Steam" subtitle="Ligue a importação automática uma vez e as suas partidas novas entram sozinhas." />
    {isLoading || (isAuthenticated && !status && !error) ? <div role="status" aria-label="Carregando" className="space-y-4">
        <div className="h-24 animate-pulse rounded-xl bg-card" /><div className="h-80 animate-pulse rounded-xl bg-card" /></div>
    : !isAuthenticated ? <LoginPrompt title="Conexão Steam" text="Entre com a Steam para ligar a importação automática das suas partidas." />
    : status && !status.access ? <Panel className="space-y-2 p-8 text-center"><h2 className="font-display text-3xl">Beta fechado</h2>
        <p className="mx-auto max-w-lg text-muted-foreground">A importação de partidas está liberada só por convite por enquanto. Para entrar, abra o link de convite que alguém do CS2 Hub te mandou.</p></Panel>
    : <>
      {error && <Alert>{error}</Alert>}
      {message && <p role="status" className="rounded-xl border border-win/30 bg-win/10 p-4 text-sm">{message}</p>}

      <Panel className="flex flex-wrap items-center gap-4 p-5" style={rise(1)}>
        <state.icon className={`h-8 w-8 shrink-0 ${state.tone}`} />
        <div className="min-w-0 flex-1 basis-56"><p className="font-semibold">{state.title}</p><p className="text-sm text-muted-foreground">{state.text}</p></div>
        {t && <Button asChild variant="outline" className="w-full sm:w-auto"><Link href="/partidas">Ver partidas<ArrowRight className="h-4 w-4" /></Link></Button>}
      </Panel>

      <Panel className="p-5 md:p-6" style={rise(2)}>
        <PanelTitle aside={t ? <Pill kind="dark">trocar os códigos</Pill> : undefined}>{t ? 'Códigos da Steam' : 'Ligar a importação'}</PanelTitle>
        <ol className="mt-4 grid gap-3 text-sm md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => <li key={title} className="flex gap-3 rounded-lg bg-black/20 p-3 ring-1 ring-white/[0.06]">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">{i + 1}</span>
            <span><span className="flex items-center gap-1.5 font-semibold"><Icon className="h-4 w-4 text-muted-foreground" />{title}</span><span className="mt-0.5 block text-muted-foreground">{text}</span></span>
          </li>)}
        </ol>
        <form onSubmit={save} className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="tracking-auth">Código de autenticação</Label>
            <Input id="tracking-auth" type="password" autoComplete="off" value={authCode} onChange={e => setAuthCode(e.target.value)} placeholder="AAAA-AAAAA-AAAA"
              required pattern="[A-Za-z0-9]{4}-[A-Za-z0-9]{5}-[A-Za-z0-9]{4}" maxLength={15} /></div>
          <div className="space-y-2"><Label htmlFor="tracking-match">Código da partida mais recente</Label>
            <Input id="tracking-match" autoComplete="off" value={shareCode} onChange={e => setShareCode(e.target.value)} placeholder="CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx"
              required pattern="CSGO-([A-Za-z0-9]{5}-){4}[A-Za-z0-9]{5}" maxLength={34} /></div>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <Button disabled={busy || !status?.serverConfigured} type="submit">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{t ? 'Salvar códigos novos' : 'Ligar importação'}{!busy && <ArrowRight className="h-4 w-4" />}</Button>
            {t && <Button variant="danger-ghost" type="button" disabled={busy} onClick={() => void disconnect()}>Desligar importação</Button>}
            <p className="text-xs text-muted-foreground">{status?.serverConfigured ? 'O código fica criptografado no servidor. Desligar não apaga as partidas já importadas.' : 'O servidor ainda não está configurado.'}</p>
          </div>
        </form>
      </Panel>

      {!!status?.queue.length && <Panel className="p-5" style={rise(3)}><PanelTitle>Importando agora</PanelTitle>
        <ul className="mt-4 space-y-3 text-sm">{status.queue.map(job => <li key={job.id} className="flex flex-wrap justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
          <span>Partida #{job.id} · {job.status === 'FAILED' ? 'Não importada' : job.status === 'PROCESSING' ? 'Processando' : 'Na fila'}</span>
          <span className="text-muted-foreground">{job.lastError || 'A demo será baixada automaticamente.'}</span></li>)}</ul>
      </Panel>}
    </>}
  </>;
}
