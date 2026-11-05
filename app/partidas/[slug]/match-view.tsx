'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Share2 } from 'lucide-react';
import { Header } from '@/components/header';
import { MatchScoreboard } from '@/components/match-scoreboard';
import { SteamLoginButton } from '@/components/auth/SteamLoginButton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { MatchDetail, trackingApi } from '@/lib/services/tracking.service';
import { formatDate, mapName, matchPath, modeLabel, parseMatchSlug, resultColor, resultLabel } from '@/lib/match';

export function MatchView({ slug }: { slug: string }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
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

  return <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto max-w-7xl px-4 py-6 md:py-10 space-y-6">
      <Link href="/partidas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Partidas</Link>
      {!parsed ? <p role="alert">Endereço de partida inválido.</p>
      : authLoading ? <p role="status">Verificando sua sessão…</p>
      : !isAuthenticated ? <section className="rounded-xl border border-border bg-card/50 p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold">Entre para ver esta partida</h1>
          <p className="text-muted-foreground">O placar completo aparece para quem jogou a partida.</p>
          <div className="flex justify-center"><SteamLoginButton /></div></section>
      : error ? <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</p>
      : !match ? <p role="status" className="py-10 text-center text-muted-foreground">Carregando a partida…</p>
      : <>
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold capitalize leading-none" style={{ fontFamily: 'var(--font-new-amsterdam)' }}>{title}</h1>
            <p className="text-sm text-muted-foreground mt-3">{modeLabel(match.mode)} · {formatDate(match.playedAt, 'long')} · {match.rounds} rounds</p>
          </div>
          <div className="flex items-center gap-4">
            {me && <div className="text-right"><p className="text-4xl font-bold tabular-nums">{me.scoreFor} <span className="text-muted-foreground">:</span> {me.scoreAgainst}</p>
              <p className={`text-sm font-medium ${resultColor(me.scoreFor, me.scoreAgainst)}`}>{resultLabel(me.scoreFor, me.scoreAgainst)}</p></div>}
            <Button variant="outline" onClick={() => void share()}>{copied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}{copied ? 'Link copiado' : 'Compartilhar'}</Button>
          </div>
        </section>
        <MatchScoreboard match={match} viewer={user?.steamId} />
      </>}
    </main>
  </div>;
}
