import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { artBackground, formatDate, mapName, modeLabel, resultLabel } from '@/lib/match';
import { rise } from '@/lib/motion';

// Peças visuais do CS2 Hub (direção NextPlay): painéis grafite, pílulas coloridas,
// arte dos mapas e entrada em sequência. Use estas em vez de montar o visual na página.

type PillKind = 'premier' | 'win' | 'loss' | 'draw' | 'dark' | 'highlight' | 'primary';
const PILL: Record<PillKind, string> = {
  premier: 'bg-premier text-white',
  win: 'bg-emerald-500 text-emerald-950',
  loss: 'bg-loss/20 text-loss',
  draw: 'bg-draw/20 text-draw',
  dark: 'bg-black/50 text-zinc-300 ring-1 ring-white/10',
  highlight: 'bg-highlight text-amber-950',
  primary: 'bg-primary text-primary-foreground',
};

export function Pill({ kind = 'dark', children, className = '' }: { kind?: PillKind; children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${PILL[kind]} ${className}`}>
    {kind === 'premier' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}{children}</span>;
}

export const resultPill = (scoreFor: number, scoreAgainst: number) =>
  <Pill kind={scoreFor === scoreAgainst ? 'draw' : scoreFor > scoreAgainst ? 'win' : 'loss'}>{resultLabel(scoreFor, scoreAgainst)}</Pill>;

export function Panel({ className = '', style, children, id }: { className?: string; style?: React.CSSProperties; children: React.ReactNode; id?: string }) {
  return <section id={id} className={`rounded-xl bg-card ring-1 ring-white/[0.06] ${className}`} style={style}>{children}</section>;
}

export function PanelTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">{children}</h2>{aside}</div>;
}

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; eyebrow?: React.ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-3" style={rise(0)}>
    <div className="min-w-0">{eyebrow && <div className="mb-2">{eyebrow}</div>}
      <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}</div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>;
}

/** Destaque com a arte do mapa ao fundo e o conteúdo por cima. */
export function ArtHero({ map, children, height = 'h-64 md:h-80', className = '' }: { map?: string | null; children: React.ReactNode; height?: string; className?: string }) {
  return <div className={`relative overflow-hidden rounded-xl ring-1 ring-white/[0.06] ${className}`} style={rise(0)}>
    <div className={`${height} bg-cover bg-center`} style={{ backgroundImage: artBackground(map) }} />
    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
    <div className="absolute inset-x-3 bottom-3 md:inset-x-4 md:bottom-4">{children}</div>
  </div>;
}

export function StatTile({ label, value, note, tone = '', i = 0 }: { label: string; value: React.ReactNode; note?: React.ReactNode; tone?: string; i?: number }) {
  return <Panel className="p-4" style={rise(i)}>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={`mt-1 text-2xl font-bold tabular-nums md:text-3xl ${tone}`}>{value}</p>
    {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
  </Panel>;
}

/** Card de partida com a arte do mapa: usado em Partidas, perfil e grupo. */
export function MatchArtCard({ href, map, mode, playedAt, scoreFor, scoreAgainst, premierDelta, children, i = 0, cta = 'Ver placar' }: {
  href?: string; map: string; mode: string; playedAt: string; scoreFor: number; scoreAgainst: number; premierDelta?: number | null;
  children?: React.ReactNode; i?: number; cta?: string;
}) {
  const body = <>
    <div className="relative h-32 overflow-hidden sm:h-36">
      <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: artBackground(map, true) }} />
      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[11px] font-bold uppercase text-white backdrop-blur">{mode === 'wingman' ? '2×2' : '5×5'}</span>
    </div>
    <div className="space-y-2 p-3.5 pt-1">
      <div className="flex flex-wrap items-center gap-1.5">
        {resultPill(scoreFor, scoreAgainst)}
        {premierDelta != null && <Pill kind="premier">{premierDelta > 0 ? '+' : ''}{premierDelta}</Pill>}
        <span className="ml-auto text-[11px] font-semibold uppercase text-muted-foreground">{formatDate(playedAt)}</span>
      </div>
      <p className="text-lg font-bold capitalize leading-tight">{mapName(map)} <span className="text-muted-foreground">·</span> <span className="tabular-nums">{scoreFor}:{scoreAgainst}</span>
        <span className="sr-only"> · {modeLabel(mode)}</span></p>
      {children}
      {href && <span className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-rose-950/40 transition group-hover:brightness-110">{cta}<ChevronRight className="h-4 w-4" /></span>}
    </div>
  </>;
  const cls = 'group block overflow-hidden rounded-xl bg-card ring-1 ring-white/[0.06] transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 hover:ring-white/15';
  return href ? <Link href={href} className={cls} style={rise(i)}>{body}</Link> : <div className={cls} style={rise(i)}>{body}</div>;
}

/** Iniciais do grupo num quadrado colorido (cor fixa por id). */
const GROUP_COLORS = ['#e11d48', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#14b8a6'];
export const groupColor = (id: number) => GROUP_COLORS[id % GROUP_COLORS.length];
export const initials = (name: string) => name.split(/\s+/).filter(w => w.length > 2 || /\d/.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase() || name.slice(0, 2).toUpperCase();
export function GroupTile({ id, name, className = 'h-9 w-9 text-[11px]' }: { id: number; name: string; className?: string }) {
  return <span className={`flex shrink-0 items-center justify-center rounded-lg font-black text-white ${className}`} style={{ background: groupColor(id) }}>{initials(name)}</span>;
}
