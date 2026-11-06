'use client';

import { useState } from 'react';
import { SteamLoginButton } from '@/components/auth/SteamLoginButton';
import { MatchArtCard, Panel, StatTile } from '@/components/kit';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatNumber } from '@/lib/match';
import { rise } from '@/lib/motion';
import type { MatchCard, PeriodStats, PlayerLine } from '@/lib/services/tracking.service';

// Peças comuns das telas logadas (perfil, grupo, convite), já no visual do kit.

export const PERIODS = [{ value: 7, label: 'Últimos 7 dias' }, { value: 30, label: 'Últimos 30 dias' }, { value: 90, label: 'Últimos 90 dias' }, { value: 0, label: 'Todo o histórico' }];

export function PeriodSelect({ value, onChange }: { value: number; onChange: (days: number) => void }) {
  return <select aria-label="Período" className="h-9 rounded-lg border border-border bg-card px-3 text-sm" value={value} onChange={e => onChange(Number(e.target.value))}>
    {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
  </select>;
}

export function UserAvatar({ src, name, className = 'h-10 w-10' }: { src?: string | null; name: string; className?: string }) {
  return <Avatar className={`rounded-lg ${className}`}><AvatarImage src={src ?? undefined} alt={name} /><AvatarFallback className="rounded-lg">{name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>;
}

export const ratingTone = (r: number | null | undefined) => r == null ? 'text-muted-foreground' : r >= 1.1 ? 'text-win' : r < 0.9 ? 'text-loss' : 'text-foreground';

export function StatGrid({ stats }: { stats: PeriodStats }) {
  const losses = stats.matches - stats.wins - stats.draws;
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
    <StatTile i={1} label="Rating" value={stats.rating == null ? '—' : stats.rating.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tone={ratingTone(stats.rating)} note="1,00 = média da partida" />
    <StatTile i={2} label="Partidas" value={stats.matches} note={`${stats.wins}V ${losses}D${stats.draws ? ` ${stats.draws}E` : ''}`} />
    <StatTile i={3} label="Vitórias" value={formatNumber(stats.winRate, '%')} />
    <StatTile i={4} label="K/D" value={formatNumber(stats.kd)} note={`${stats.kills} abates · ${stats.deaths} mortes`} />
    <StatTile i={5} label="ADR" value={formatNumber(stats.adr)} note="dano por round" />
    <StatTile i={6} label="HS" value={formatNumber(stats.hsPercent, '%')} note="dos abates" />
  </div>;
}

const line = (p: PlayerLine) => <>{p.kills}/{p.deaths}/{p.assists} · ADR {p.adr ?? '—'} · Rating <span className={`font-semibold ${ratingTone(p.rating)}`}>{p.rating == null ? '—' : p.rating.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></>;

/** Partida em card com arte. Só vira link para quem jogou (o placar completo é de quem jogou). */
export function MatchRow({ match, players, i = 0 }: { match: MatchCard; players?: PlayerLine[]; i?: number }) {
  return <MatchArtCard href={match.viewerPlayed ? `/partidas/${match.id}` : undefined} map={match.map} mode={match.mode} playedAt={match.playedAt}
    scoreFor={match.scoreFor} scoreAgainst={match.scoreAgainst} premierDelta={players ? null : match.player.premierDelta} i={i}>
    <div className="space-y-0.5 text-sm tabular-nums text-muted-foreground">
      {(players ?? [match.player]).map(p => <p key={p.steamId}>{players && <span className="font-medium text-foreground">{p.name} </span>}{line(p)}</p>)}
    </div>
  </MatchArtCard>;
}

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  async function copy(text: string, key = text) {
    await navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 2500);
  }
  return { copied, copy };
}

/** Pedido de login com arte de mapa ao fundo. */
export function LoginPrompt({ text, title = 'Entre com a Steam' }: { text: string; title?: string }) {
  return <section className="relative overflow-hidden rounded-xl ring-1 ring-white/[0.06]" style={rise(0)}>
    <div className="absolute inset-0 grid grid-cols-3 opacity-30">{['mirage', 'nuke', 'ancient'].map(m => <div key={m} className="bg-cover bg-center" style={{ backgroundImage: `url(/images/maps/art/${m}-sm.webp)` }} />)}</div>
    <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
    <div className="relative space-y-4 px-6 py-14 text-center md:py-20">
      <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
      <p className="mx-auto max-w-md text-muted-foreground">{text}</p>
      <div className="flex justify-center"><SteamLoginButton /></div>
      <p className="text-xs text-muted-foreground">Não pedimos sua senha: o login é feito na própria Steam.</p>
    </div>
  </section>;
}

export const Alert = ({ children }: { children: React.ReactNode }) =>
  <div role="alert" className="rounded-xl border border-loss/30 bg-loss/10 p-4 text-sm text-foreground">{children}</div>;

/** Título de página (mantido para telas simples). */
export function PageTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h1 className={`font-display text-3xl md:text-4xl ${className}`}>{children}</h1>;
}

export { Panel };
