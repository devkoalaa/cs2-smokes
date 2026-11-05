'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SteamLoginButton } from '@/components/auth/SteamLoginButton';
import { formatDate, formatNumber, mapName, modeLabel, resultColor, resultLabel } from '@/lib/match';
import type { MatchCard, PeriodStats, PlayerLine } from '@/lib/services/tracking.service';

// Peças comuns das telas de perfil, grupo e convite.

export const PERIODS = [{ value: 7, label: 'Últimos 7 dias' }, { value: 30, label: 'Últimos 30 dias' }, { value: 90, label: 'Últimos 90 dias' }, { value: 0, label: 'Todo o histórico' }];

export function PeriodSelect({ value, onChange }: { value: number; onChange: (days: number) => void }) {
  return <select aria-label="Período" className="bg-card border border-border rounded-md px-2 py-1.5 text-sm" value={value} onChange={e => onChange(Number(e.target.value))}>
    {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
  </select>;
}

export function UserAvatar({ src, name, className = 'h-10 w-10' }: { src?: string | null; name: string; className?: string }) {
  return <Avatar className={className}><AvatarImage src={src ?? undefined} alt={name} /><AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>;
}

export function StatGrid({ stats }: { stats: PeriodStats }) {
  const losses = stats.matches - stats.wins - stats.draws;
  const tiles = [
    ['Partidas', String(stats.matches), `${stats.wins}V ${losses}D${stats.draws ? ` ${stats.draws}E` : ''}`],
    ['Vitórias', formatNumber(stats.winRate, '%'), 'das partidas'],
    ['Rating', stats.rating == null ? '—' : stats.rating.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), '1,00 = média da partida'],
    ['K/D', formatNumber(stats.kd), `${stats.kills} abates · ${stats.deaths} mortes`],
    ['ADR', formatNumber(stats.adr), 'dano por round'],
    ['HS', formatNumber(stats.hsPercent, '%'), 'dos abates'],
  ];
  return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">{tiles.map(([label, value, note]) =>
    <div key={label} className="rounded-xl border border-border bg-card/50 p-4"><p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p><p className="text-xs text-muted-foreground mt-1">{note}</p></div>)}</div>;
}

// No celular o Rating sai da linha para ela caber sem cortar.
const line = (p: PlayerLine) => <>{p.kills}/{p.deaths}/{p.assists} · ADR {p.adr ?? '—'}<span className="hidden sm:inline"> · Rating {p.rating == null ? '—' : p.rating.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></>;

/** Uma partida numa lista. Só vira link para quem jogou (o placar completo é de quem jogou). */
export function MatchRow({ match, players }: { match: MatchCard; players?: PlayerLine[] }) {
  const body = <>
    <div className="min-w-0 flex-1">
      <p><span className="font-semibold capitalize">{mapName(match.map)}</span> <span className="text-xs text-muted-foreground">{modeLabel(match.mode)} · {formatDate(match.playedAt)}</span></p>
      {(players ?? [match.player]).map(p => <p key={p.steamId} className="text-sm tabular-nums text-muted-foreground">
        {players && <span className="text-foreground">{p.name} </span>}{line(p)}</p>)}
    </div>
    <div className="text-right shrink-0"><p className="font-semibold tabular-nums">{match.scoreFor}:{match.scoreAgainst}</p>
      <p className={`text-xs font-medium ${resultColor(match.scoreFor, match.scoreAgainst)}`}>{resultLabel(match.scoreFor, match.scoreAgainst)}</p></div>
  </>;
  return match.viewerPlayed
    ? <Link href={`/partidas/${match.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-card/60">{body}<ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" /></Link>
    : <div className="flex items-center gap-3 px-4 py-3">{body}<span className="w-4 shrink-0" /></div>;
}

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  async function copy(text: string, key = text) {
    await navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 2500);
  }
  return { copied, copy };
}

export function LoginPrompt({ text }: { text: string }) {
  return <section className="rounded-xl border border-border bg-card/50 p-8 md:p-12 text-center space-y-5">
    <p className="text-muted-foreground">{text}</p><div className="flex justify-center"><SteamLoginButton /></div></section>;
}

export const Alert = ({ children }: { children: React.ReactNode }) =>
  <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200">{children}</div>;
