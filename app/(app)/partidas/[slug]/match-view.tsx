'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ImageIcon, Loader2, Share2 } from 'lucide-react';
import { Alert, LoginPrompt } from '@/components/hub-ui';
import { ArtHero, Pill, resultPill } from '@/components/kit';
import { rise } from '@/lib/motion';
import { KillMap } from '@/components/kill-map';
import { MatchScoreboard } from '@/components/match-scoreboard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth';
import { MatchDetail, trackingApi } from '@/lib/services/tracking.service';
import { formatDate, mapName, matchPath, modeLabel, parseMatchSlug, resultColor } from '@/lib/match';

export function MatchView({ slug }: { slug: string }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState('');
  const [image, setImage] = useState<'idle' | 'working' | 'copied' | 'shared' | 'saved'>('idle');
  const parsed = parseMatchSlug(slug);

  useEffect(() => {
    if (!isAuthenticated || !parsed) return;
    let active = true;
    setError('');
    trackingApi.detail(parsed.id).then(value => {
      if (!active) return;
      setMatch(value);
      // Quem abriu pelo número puro passa a ter na barra o endereço com miniatura.
      const path = matchPath(value.id, value.shareKey);
      if (window.location.pathname !== path) window.history.replaceState(null, '', path);
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [isAuthenticated, parsed?.id]);

  const me = match?.players.find(p => p.steamId === user?.steamId);
  const title = match ? mapName(match.map) : 'Partida';

  async function share() {
    if (!match) return;
    const url = window.location.origin + matchPath(match.id, match.shareKey);
    if (navigator.share) {
      try { await navigator.share({ title: `Partida na ${title}`, url }); return; }
      catch (e) { if ((e as Error).name === 'AbortError') return; }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // A imagem é pedida já dentro do clique: o Safari só libera a área de
  // transferência se o ClipboardItem for criado no gesto, com a promessa do PNG.
  async function copyTeam() {
    if (!match || image === 'working') return;
    setImage('working'); setImageError('');
    const png = fetch(`${matchPath(match.id, match.shareKey)}/time`, { headers: { Authorization: `Bearer ${AuthService.getInstance().getToken()}` }, cache: 'no-store' })
      .then(async r => { if (!r.ok) throw new Error((await r.json().catch(() => null))?.message || 'Não foi possível gerar a imagem.'); return r.blob(); });
    let done: typeof image = 'copied';
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
    } catch {
      try {
        const file = new File([await png], `${mapName(match.map)}-${match.id}.png`, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          try { await navigator.share({ files: [file] }); done = 'shared'; }
          catch (e) { if ((e as Error).name === 'AbortError') { setImage('idle'); return; } throw e; }
        } else {
          const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(file), download: file.name });
          link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 10000); done = 'saved';
        }
      } catch (e) { setImageError((e as Error).message); setImage('idle'); return; }
    }
    setImage(done);
    setTimeout(() => setImage('idle'), 3000);
  }

  // Lados CT/TR por metade, do ponto de vista de quem está vendo.
  const halves = match?.analysis?.segments.map(seg => ({ ct: (seg.sideA === 3) !== !!me?.team, wins: seg.wins[me?.team ?? 0] })) ?? [];

  return <>
    <nav aria-label="Caminho" className="text-sm text-muted-foreground"><Link href="/partidas" className="hover:text-foreground">Partidas</Link>
      {match && <><span className="mx-1.5 text-zinc-600">/</span><span className="text-foreground">{title.replace(/^./, c => c.toUpperCase())}</span></>}</nav>
    {!parsed ? <Alert>Endereço de partida inválido.</Alert>
    : authLoading ? <p role="status" className="text-muted-foreground">Verificando sua sessão…</p>
    : !isAuthenticated ? <LoginPrompt title="Entre para ver esta partida" text="O placar completo e o mapa de abates aparecem para quem jogou a partida." />
    : error ? <Alert>{error}</Alert>
    : !match ? <p role="status" className="py-10 text-center text-muted-foreground">Carregando a partida…</p>
    : <>
      <ArtHero map={match.map} height="min-h-60 md:min-h-80">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-1.5">{match.analysis?.premier ? <Pill kind="premier">Premier</Pill> : null}<Pill>{modeLabel(match.mode)} · {match.rounds} rounds</Pill></div>
            <h1 className="mt-2 font-display text-5xl capitalize md:text-6xl">{title}</h1>
            <p className="text-sm text-zinc-300">{formatDate(match.playedAt, 'long')}</p>
          </div>
          {me && <div className="flex items-center gap-4 rounded-xl bg-surface/90 px-5 py-3 ring-1 ring-white/[0.08] backdrop-blur">
            <div className="text-center"><p className="text-[11px] text-muted-foreground">Seu time</p><p className={`text-4xl font-black tabular-nums md:text-5xl ${resultColor(me.scoreFor, me.scoreAgainst)}`}>{me.scoreFor}</p></div>
            <span className="text-2xl text-zinc-600">:</span>
            <div className="text-center"><p className="text-[11px] text-muted-foreground">Adversário</p><p className="text-4xl font-black tabular-nums md:text-5xl">{me.scoreAgainst}</p></div>
          </div>}
        </div>
      </ArtHero>
      <div className="flex flex-wrap items-center gap-2" style={rise(1)}>
        <Button onClick={() => void share()}>{copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}{copied ? 'Link copiado' : 'Compartilhar'}</Button>
        <Button variant="outline" disabled={image === 'working'} onClick={() => void copyTeam()}>
          {image === 'working' ? <Loader2 className="h-4 w-4 animate-spin" /> : image === 'idle' ? <ImageIcon className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {{ idle: 'Copiar imagem do time', working: 'Gerando imagem…', copied: 'Imagem copiada', shared: 'Imagem enviada', saved: 'Imagem baixada' }[image]}</Button>
        {me && <div className="ml-auto">{resultPill(me.scoreFor, me.scoreAgainst)}</div>}
        {!!halves.length && <div className="flex gap-1.5">{halves.map((h, i) => <span key={i} title={h.ct ? 'Rounds vencidos de CT' : 'Rounds vencidos de TR'}
          className={`rounded-md px-2 py-1 text-xs font-bold ${h.ct ? 'bg-ct/15 text-ct' : 'bg-tr/15 text-tr'}`}>{h.ct ? 'CT' : 'TR'} {h.wins}</span>)}</div>}
      </div>
      {imageError && <Alert>{imageError}</Alert>}
      <div style={rise(2)}><MatchScoreboard match={match} viewer={user?.steamId} /></div>
      <div style={rise(3)}><KillMap match={match} viewer={user?.steamId} /></div>
    </>}
  </>;
}
