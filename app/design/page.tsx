'use client';

import { useState } from 'react';
import { ArrowRight, BarChart3, ChevronRight, Crosshair, ImageIcon, Map as MapIcon, Radar, RefreshCw, Search, Settings2, Share2, Swords, Trophy, UserRound, Users } from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { mapName } from '@/lib/match';
import { RADARS, toRadar } from '@/lib/radar';
import data from './data.json';

// Prévia das duas direções visuais com dados reais (nomes de terceiros trocados).
// A = produto limpo (Linear/Leetify). B = a mesma base com linguagem tática de HUD.

type V = 'a' | 'b';
type Screen = 'inicio' | 'partidas' | 'partida';
type Player = (typeof data.match.players)[number];

const MATCH = data.match, HISTORY = data.history;
const ME = MATCH.players.find(p => p.id === 'me')!;
const fmt = (n: number | null | undefined, d = 0) => n == null ? '—' : n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const date = (s: string) => new Date(s).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace('.', '');
const thumb = (map: string) => RADARS[map] ? `/images/maps/thumbs/${map.replace('de_', '')}.webp` : null;
const ratingTone = (r: number | null) => r == null ? 'text-zinc-500' : r >= 1.1 ? 'text-emerald-400' : r < 0.9 ? 'text-red-400' : 'text-zinc-100';
const total = MATCH.players.reduce((s, p) => ({ k: s.k + p.k, a: s.a + p.a, dmg: s.dmg + (p.dmg ?? 0) }), { k: 0, a: 0, dmg: 0 });
const rating = (p: Player) => (0.5 * p.k / total.k + 0.35 * (p.dmg ?? 0) / total.dmg + 0.15 * p.a / total.a) * MATCH.players.length;

// Estilos que mudam entre as direções; o resto é igual.
const ui = (v: V) => ({
  page: v === 'a' ? 'bg-[#09090b]' : 'bg-[#0a0b0d]',
  card: v === 'a' ? 'rounded-xl border border-white/[0.07] bg-white/[0.02]' : 'relative rounded-[3px] border border-white/[0.09] bg-[#0e1014]',
  label: v === 'a' ? 'text-xs text-zinc-500' : 'font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500',
  num: v === 'a' ? 'font-semibold tabular-nums tracking-tight' : 'font-mono font-medium tabular-nums',
  btn: v === 'a' ? 'rounded-lg' : 'rounded-[3px] font-mono text-xs uppercase tracking-widest',
  chip: v === 'a' ? 'rounded-full px-2.5 py-0.5 text-xs' : 'rounded-[2px] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest',
});

function Brackets({ v }: { v: V }) {
  if (v === 'a') return null;
  const c = 'pointer-events-none absolute h-2.5 w-2.5 border-primary/70';
  return <><span className={`${c} -left-px -top-px border-l border-t`} /><span className={`${c} -right-px -top-px border-r border-t`} />
    <span className={`${c} -bottom-px -left-px border-b border-l`} /><span className={`${c} -bottom-px -right-px border-b border-r`} /></>;
}

function Card({ v, className = '', children }: { v: V; className?: string; children: React.ReactNode }) {
  return <div className={`${ui(v).card} ${className}`}><Brackets v={v} />{children}</div>;
}

function Heading({ v, eyebrow, title, sub }: { v: V; eyebrow?: string; title: string; sub?: string }) {
  return <div>
    {v === 'b' && eyebrow && <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">{`// ${eyebrow}`}</p>}
    <h1 className={v === 'a' ? 'text-2xl font-semibold tracking-tight text-zinc-50' : 'mt-1 text-2xl font-semibold uppercase tracking-wide text-zinc-50'}>{title}</h1>
    {sub && <p className="mt-1 text-sm text-zinc-500">{sub}</p>}
  </div>;
}

function Result({ v, sf, sa }: { v: V; sf: number; sa: number }) {
  const win = sf > sa, draw = sf === sa;
  if (v === 'b') return <span className={`${ui(v).chip} border ${draw ? 'border-amber-400/40 text-amber-300' : win ? 'border-emerald-400/40 text-emerald-400' : 'border-red-400/40 text-red-400'}`}>{draw ? 'E' : win ? 'V' : 'D'}</span>;
  return <span className={`${ui(v).chip} font-medium ${draw ? 'bg-amber-400/10 text-amber-300' : win ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>{draw ? 'Empate' : win ? 'Vitória' : 'Derrota'}</span>;
}

// ---------- casca do app (logado) ----------

function Shell({ v, screen, children }: { v: V; screen: Screen; children: React.ReactNode }) {
  const nav: [string, React.ElementType, Screen | null][] = [['Partidas', BarChart3, 'partidas'], ['Grupos', Users, null], ['Smokes', MapIcon, null], ['Perfil', UserRound, null]];
  const active = screen === 'partida' ? 'partidas' : screen;
  return <div className="flex min-h-screen">
    <aside className={`hidden lg:flex w-60 shrink-0 flex-col border-r border-white/[0.06] ${v === 'a' ? 'bg-[#0b0b0d]' : 'bg-[#0c0d10]'} p-3`}>
      <div className="flex items-center gap-2.5 px-2 py-2"><BrandMark className="h-8 w-8" /><span className={v === 'a' ? 'font-semibold tracking-tight' : 'font-mono text-sm font-semibold uppercase tracking-[0.2em]'}>CS2 Hub</span></div>
      <div className={`mt-4 flex items-center gap-2 rounded-lg border border-white/[0.06] px-2.5 py-1.5 text-sm text-zinc-500 ${v === 'b' ? 'rounded-[3px]' : ''}`}><Search className="h-3.5 w-3.5" />Buscar<kbd className="ml-auto font-mono text-[10px]">⌘K</kbd></div>
      <nav className="mt-4 space-y-0.5">{nav.map(([label, Icon, target]) => {
        const on = target === active;
        return <div key={label} className={`relative flex items-center gap-2.5 px-2.5 py-1.5 text-sm ${v === 'a' ? `rounded-md ${on ? 'bg-white/[0.06] text-zinc-50' : 'text-zinc-400'}` : `font-mono text-xs uppercase tracking-widest ${on ? 'text-zinc-50' : 'text-zinc-500'}`}`}>
          {v === 'b' && on && <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary" />}
          <Icon className={`h-4 w-4 ${on ? 'text-primary' : ''}`} />{label}</div>;
      })}</nav>
      <p className={`mt-6 px-2.5 ${ui(v).label}`}>Grupos</p>
      {['Squad da quinta', 'Faculdade'].map(g => <div key={g} className="flex items-center gap-2.5 px-2.5 py-1.5 text-sm text-zinc-400"><span className="h-1.5 w-1.5 rounded-full bg-primary/70" />{g}</div>)}
      <div className="mt-auto flex items-center gap-2.5 rounded-lg px-2 py-2">
        <span className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800" /><div className="min-w-0"><p className="truncate text-sm font-medium">koala</p><p className="text-xs text-zinc-500">Importação ligada</p></div>
      </div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3 lg:hidden"><BrandMark className="h-7 w-7" /><span className="font-semibold">CS2 Hub</span></header>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  </div>;
}

// ---------- Partidas ----------

function Partidas({ v, open }: { v: V; open: () => void }) {
  const s = ui(v);
  const wins = HISTORY.filter(m => m.sf > m.sa).length;
  const kd = HISTORY.reduce((a, m) => a + m.k, 0) / HISTORY.reduce((a, m) => a + m.d, 0);
  const kpis: [string, string, string, string?][] = [
    ['Rating', fmt(0.76, 2), '1,00 = média da partida', 'text-red-400'], ['Vitórias', `${Math.round(100 * wins / HISTORY.length)}%`, `${wins}V ${HISTORY.length - wins}D`],
    ['K/D', fmt(kd, 2), '80 abates · 99 mortes'], ['ADR', fmt(57.7, 1), 'dano por round'], ['HS', '36%', 'dos abates'],
  ];
  const adr = [...HISTORY].reverse().map(m => m.adr ?? 0), max = Math.max(...adr) * 1.15;
  const pts = adr.map((y, i) => `${(i / (adr.length - 1)) * 100},${40 - (y / max) * 40}`).join(' ');
  return <>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <Heading v={v} eyebrow="Histórico" title="Partidas" sub="Últimos 30 dias · 8 partidas importadas da Steam" />
      <div className="flex gap-2">
        <button className={`${s.btn} flex items-center gap-2 border border-white/10 px-3 py-1.5 text-sm text-zinc-300`}><RefreshCw className="h-3.5 w-3.5" />Atualizar</button>
        <button className={`${s.btn} flex items-center gap-2 border border-white/10 px-3 py-1.5 text-sm text-zinc-300`}><Settings2 className="h-3.5 w-3.5" />Conexão</button>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <div className={`flex border border-white/10 p-0.5 ${v === 'a' ? 'rounded-lg' : 'rounded-[3px]'}`}>{['7d', '30d', '90d', 'Tudo'].map(p =>
        <span key={p} className={`px-3 py-1 text-xs ${v === 'a' ? 'rounded-md' : 'rounded-[2px] font-mono uppercase tracking-widest'} ${p === '30d' ? 'bg-white/10 text-zinc-50' : 'text-zinc-500'}`}>{p}</span>)}</div>
      {['Todas as modalidades', 'Todos os mapas', 'Squad da quinta'].map(f => <span key={f} className={`border border-white/10 px-3 py-1 text-xs text-zinc-400 ${v === 'a' ? 'rounded-lg' : 'rounded-[3px] font-mono uppercase tracking-wider'}`}>{f}</span>)}
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{kpis.map(([label, value, note, tone], i) =>
      <Card key={label} v={v} className={`p-4 ${i === 0 ? 'col-span-2 md:col-span-1' : ''}`}>
        <p className={s.label}>{label}</p>
        <p className={`mt-2 text-3xl ${s.num} ${tone ?? 'text-zinc-50'}`}>{value}</p>
        <p className="mt-1 text-xs text-zinc-500">{note}</p>
      </Card>)}</div>
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <Card v={v} className="p-5">
        <div className="flex items-baseline justify-between"><p className={v === 'a' ? 'font-medium' : s.label}>ADR por partida</p><span className={`text-xs text-zinc-500 ${v === 'b' ? 'font-mono' : ''}`}>média 57,7</span></div>
        <svg viewBox="0 0 100 44" preserveAspectRatio="none" className="mt-4 h-32 w-full overflow-visible">
          <defs><linearGradient id={`g${v}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#a855f7" stopOpacity="0.35" /><stop offset="1" stopColor="#a855f7" stopOpacity="0" /></linearGradient></defs>
          {v === 'b' && [10, 20, 30].map(y => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="white" strokeOpacity="0.06" strokeWidth="0.3" />)}
          <polygon points={`0,40 ${pts} 100,40`} fill={`url(#g${v})`} />
          <polyline points={pts} fill="none" stroke="#a855f7" strokeWidth="0.8" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 2 }} />
        </svg>
      </Card>
      <Card v={v} className="p-5">
        <p className={v === 'a' ? 'font-medium' : s.label}>Mapas</p>
        <ul className="mt-3 space-y-3">{[['Mirage', 3, 1], ['Nuke', 2, 1], ['Vertigo', 1, 1], ['Ancient', 1, 1], ['Inferno', 1, 0]].map(([n, m, w]) =>
          <li key={n as string} className="text-sm"><div className="flex justify-between"><span className="text-zinc-200">{n}</span><span className={`text-zinc-500 ${v === 'b' ? 'font-mono text-xs' : 'text-xs'}`}>{w}/{m}</span></div>
            <div className={`mt-1.5 h-1 overflow-hidden bg-white/[0.06] ${v === 'a' ? 'rounded-full' : ''}`}><div className="h-full bg-primary" style={{ width: `${100 * (w as number) / (m as number)}%` }} /></div></li>)}</ul>
      </Card>
    </div>
    <Card v={v} className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4"><p className={v === 'a' ? 'font-medium' : s.label}>Histórico</p><span className="text-xs text-zinc-500">8 partidas</span></div>
      <table className="w-full text-sm">
        <thead><tr className={`border-y border-white/[0.06] ${s.label}`}>{['Partida', 'Resultado', 'K/D/A', 'ADR', 'HS', 'Rating', ''].map((h, i) =>
          <th key={i} className={`px-5 py-2 text-left font-normal ${i >= 3 && i <= 4 ? 'hidden md:table-cell' : ''}`}>{h}</th>)}</tr></thead>
        <tbody>{HISTORY.map(m => {
          const t = thumb(m.map), win = m.sf > m.sa;
          return <tr key={m.id} onClick={open} className="cursor-pointer border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
            <td className="px-5 py-3"><div className="flex items-center gap-3">
              {v === 'b' && <span className={`h-9 w-0.5 ${win ? 'bg-emerald-400' : 'bg-red-400'}`} />}
              <span className={`h-9 w-14 shrink-0 bg-cover bg-center ${v === 'a' ? 'rounded-md' : 'rounded-[2px]'}`} style={{ backgroundImage: t ? `url(${t})` : 'linear-gradient(135deg,#1c1530,#0e0e12)' }} />
              <div><p className="font-medium capitalize text-zinc-100">{mapName(m.map)}</p><p className={`text-xs text-zinc-500 ${v === 'b' ? 'font-mono' : ''}`}>{date(m.playedAt)} · {m.mode === 'wingman' ? '2×2' : '5×5'}</p></div></div></td>
            <td className="px-5 py-3"><div className="flex items-center gap-2.5"><span className={`${s.num} text-zinc-100`}>{m.sf}:{m.sa}</span><Result v={v} sf={m.sf} sa={m.sa} /></div></td>
            <td className={`px-5 py-3 text-zinc-300 ${s.num}`}>{m.k}/{m.d}/{m.a}</td>
            <td className={`hidden px-5 py-3 text-zinc-300 md:table-cell ${s.num}`}>{m.adr}</td>
            <td className={`hidden px-5 py-3 text-zinc-300 md:table-cell ${s.num}`}>{m.hs}%</td>
            <td className={`px-5 py-3 ${s.num} ${ratingTone(m.rating)}`}>{fmt(m.rating, 2)}</td>
            <td className="pr-4 text-zinc-600"><ChevronRight className="h-4 w-4" /></td>
          </tr>;
        })}</tbody>
      </table>
    </Card>
  </>;
}

// ---------- Partida ----------

function Scoreboard({ v, team, label, tone }: { v: V; team: Player[]; label: string; tone: string }) {
  const s = ui(v);
  const first = team[0], win = first.sf > first.sa;
  return <Card v={v} className="overflow-hidden">
    <div className={`flex items-center gap-3 px-5 py-3 ${v === 'b' ? `border-l-2 ${tone}` : ''}`}>
      <span className={`text-2xl ${s.num}`}>{first.sf}</span><p className={v === 'a' ? 'font-medium' : s.label}>{label}</p><Result v={v} sf={first.sf} sa={first.sa} />
      <span className="ml-auto text-xs text-zinc-500">{win ? 'venceu' : 'perdeu'} · média de rating {fmt(team.reduce((a, p) => a + rating(p), 0) / team.length, 2)}</span>
    </div>
    <div className="overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className={`border-y border-white/[0.06] ${s.label}`}>{['Jogador', 'Rating', 'K', 'D', 'A', '+/−', 'ADR', 'HS', 'KAST', '± Premier'].map((h, i) =>
        <th key={h} className={`px-3 py-2 font-normal ${i === 0 ? 'pl-5 text-left' : 'text-right'} ${i >= 7 ? 'hidden md:table-cell' : ''}`}>{h}</th>)}</tr></thead>
      <tbody>{[...team].sort((a, b) => rating(b) - rating(a)).map(p => {
        const r = rating(p), me = p.id === 'me';
        return <tr key={p.id} className={`border-b border-white/[0.04] last:border-0 ${me ? 'bg-primary/[0.07]' : ''}`}>
          <td className={`py-2.5 pl-5 pr-3 font-medium ${me ? 'text-primary' : 'text-zinc-100'}`}>{p.name}</td>
          <td className="px-3 py-2.5 text-right"><div className="ml-auto flex w-24 items-center justify-end gap-2">
            <span className={`h-1 flex-1 overflow-hidden bg-white/[0.06] ${v === 'a' ? 'rounded-full' : ''}`}><span className={`block h-full ${r >= 1.1 ? 'bg-emerald-400' : r < 0.9 ? 'bg-red-400' : 'bg-zinc-400'}`} style={{ width: `${Math.min(100, r * 55)}%` }} /></span>
            <span className={`${s.num} ${ratingTone(r)}`}>{fmt(r, 2)}</span></div></td>
          {[p.k, p.d, p.a].map((n, i) => <td key={i} className={`px-3 py-2.5 text-right text-zinc-300 ${s.num}`}>{n}</td>)}
          <td className={`px-3 py-2.5 text-right ${s.num} ${p.k - p.d > 0 ? 'text-emerald-400' : p.k - p.d < 0 ? 'text-red-400' : 'text-zinc-500'}`}>{p.k - p.d > 0 ? '+' : ''}{p.k - p.d}</td>
          <td className={`px-3 py-2.5 text-right text-zinc-300 ${s.num}`}>{Math.round((p.dmg ?? 0) / MATCH.rounds)}</td>
          <td className={`hidden px-3 py-2.5 text-right text-zinc-300 md:table-cell ${s.num}`}>{p.k ? Math.round(100 * (p.hs ?? 0) / p.k) : 0}%</td>
          <td className={`hidden px-3 py-2.5 text-right text-zinc-300 md:table-cell ${s.num}`}>{Math.round(100 * (p.kast ?? 0) / MATCH.rounds)}%</td>
          <td className={`hidden px-3 py-2.5 text-right md:table-cell ${s.num} ${(p.delta ?? 0) > 0 ? 'text-emerald-400' : (p.delta ?? 0) < 0 ? 'text-red-400' : 'text-zinc-500'}`}>{p.delta == null ? '—' : `${p.delta > 0 ? '+' : ''}${p.delta}`}</td>
        </tr>;
      })}</tbody>
    </table></div>
  </Card>;
}

function KillMap({ v }: { v: V }) {
  const radar = RADARS[MATCH.map];
  const mine = MATCH.kills.filter(k => k.attacker === 'me' && k.attackerPos && k.victimPos);
  return <Card v={v} className="p-5">
    <div className="flex items-baseline justify-between"><p className={v === 'a' ? 'font-medium' : ui(v).label}>Mapa de abates</p><span className="text-xs text-zinc-500">{mine.length} abates seus</span></div>
    <div className={`relative mt-4 aspect-square overflow-hidden bg-black/40 ${v === 'a' ? 'rounded-lg' : 'rounded-[2px]'}`}>
      <svg viewBox="150 120 700 700" className="absolute inset-0 h-full w-full">
        <image href={radar.image} x={0} y={0} width={1024} height={1024} opacity={v === 'b' ? 0.75 : 0.9} />
        {mine.map((k, i) => { const a = toRadar(radar, k.attackerPos!), b = toRadar(radar, k.victimPos!);
          return <g key={i}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="white" strokeOpacity="0.35" strokeWidth="2.5" strokeDasharray="7 5" />
            <path d={`M${b.x - 7} ${b.y - 7}L${b.x + 7} ${b.y + 7}M${b.x + 7} ${b.y - 7}L${b.x - 7} ${b.y + 7}`} stroke="#f87171" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={a.x} cy={a.y} r="10" fill={k.attackerSide === 'CT' ? '#60a5fa' : '#fbbf24'} stroke="#000" strokeWidth="3" /></g>; })}
      </svg>
    </div>
    <div className="mt-3 flex gap-4 text-xs text-zinc-500"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#60a5fa]" />CT</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#fbbf24]" />TR</span><span><span className="text-red-400">✕</span> vítima</span></div>
  </Card>;
}

function Partida({ v }: { v: V }) {
  const s = ui(v);
  const mine = MATCH.players.filter(p => p.team === ME.team), them = MATCH.players.filter(p => p.team !== ME.team);
  return <>
    <p className={`text-sm text-zinc-500 ${v === 'b' ? 'font-mono text-xs uppercase tracking-widest' : ''}`}>Partidas <span className="mx-1.5 text-zinc-700">/</span><span className="text-zinc-300">Mirage</span></p>
    <Card v={v} className="overflow-hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${thumb(MATCH.map)})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/85 to-[#09090b]/30" />
        <div className="relative flex flex-wrap items-end justify-between gap-6 p-6 md:p-8">
          <div>
            <span className={`${s.chip} border border-primary/40 bg-primary/10 text-primary`}>Premier · 5×5</span>
            <h1 className={v === 'a' ? 'mt-3 text-4xl font-semibold tracking-tight' : 'mt-3 text-4xl font-semibold uppercase tracking-wide'}>Mirage</h1>
            <p className={`mt-1 text-sm text-zinc-400 ${v === 'b' ? 'font-mono text-xs' : ''}`}>{date(MATCH.playedAt)} · {MATCH.rounds} rounds</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right"><p className={s.label}>Seu time</p><p className={`text-5xl text-emerald-400 ${s.num}`}>{ME.sf}</p></div>
            <span className="text-3xl text-zinc-700">:</span>
            <div><p className={s.label}>Adversário</p><p className={`text-5xl text-zinc-300 ${s.num}`}>{ME.sa}</p></div>
          </div>
        </div>
        <div className="relative flex flex-wrap gap-2 border-t border-white/[0.06] px-6 py-3 md:px-8">
          <button className={`${s.btn} flex items-center gap-2 bg-primary px-3 py-1.5 text-sm font-medium text-white`}><Share2 className="h-3.5 w-3.5" />Compartilhar</button>
          <button className={`${s.btn} flex items-center gap-2 border border-white/10 px-3 py-1.5 text-sm text-zinc-300`}><ImageIcon className="h-3.5 w-3.5" />Copiar imagem do time</button>
          <div className={`ml-auto flex items-center gap-2 text-xs ${v === 'b' ? 'font-mono' : ''}`}>{MATCH.segments.map((seg, i) => { const ct = (seg.sideA === 3) !== !!ME.team;
            return <span key={i} className={`border px-2 py-1 ${v === 'a' ? 'rounded-md' : 'rounded-[2px]'} ${ct ? 'border-sky-400/30 text-sky-300' : 'border-amber-400/30 text-amber-300'}`}>{ct ? 'CT' : 'TR'} {seg.wins[ME.team]}</span>; })}</div>
        </div>
      </div>
    </Card>
    <div className="flex gap-1 border-b border-white/[0.06]">{['Placar', 'Mapa de abates', 'Mira'].map((t, i) =>
      <span key={t} className={`px-3 py-2 text-sm ${i === 0 ? 'border-b-2 border-primary text-zinc-50' : 'text-zinc-500'} ${v === 'b' ? 'font-mono text-xs uppercase tracking-widest' : ''}`}>{t}</span>)}</div>
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-4 min-w-0">
        <Scoreboard v={v} team={mine} label="Seu time" tone="border-emerald-400" />
        <Scoreboard v={v} team={them} label="Adversário" tone="border-red-400" />
      </div>
      <KillMap v={v} />
    </div>
  </>;
}

// ---------- Início (visitante) ----------

function Inicio({ v, go }: { v: V; go: () => void }) {
  const s = ui(v);
  const features: [React.ElementType, string, string][] = [
    [Swords, 'Placar completo', 'Rating, ADR, KAST, HS, clutches e saldo de Premier de todo mundo da partida.'],
    [Radar, 'Mapa de abates', 'Onde você matou e morreu em cada round, sobre o radar do mapa.'],
    [Trophy, 'Ranking com os amigos', 'Crie um grupo, mande o link e veja quem está carregando.'],
    [Crosshair, 'Smokes por mapa', 'Granadas com vídeo e a posição exata no radar.'],
  ];
  return <div className="min-h-screen">
    <header className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 md:px-8">
      <BrandMark className="h-8 w-8" /><span className={v === 'a' ? 'font-semibold tracking-tight' : 'font-mono text-sm font-semibold uppercase tracking-[0.2em]'}>CS2 Hub</span>
      <nav className={`ml-8 hidden gap-6 text-sm text-zinc-400 md:flex ${v === 'b' ? 'font-mono text-xs uppercase tracking-widest' : ''}`}><span>Smokes</span><span>Partidas</span><span>Grupos</span></nav>
      <button onClick={go} className={`${s.btn} ml-auto bg-white px-3 py-1.5 text-sm font-medium text-black`}>Entrar com Steam</button>
    </header>
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
      <div>
        {v === 'b' ? <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">{'// Beta aberto · vagas limitadas'}</p>
          : <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Beta aberto · vagas limitadas</span>}
        <h1 className={v === 'a' ? 'mt-5 text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl' : 'mt-5 text-5xl font-semibold uppercase leading-[1.02] tracking-tight md:text-6xl'}>
          Suas partidas de CS2, <span className="text-primary">explicadas.</span></h1>
        <p className="mt-5 max-w-lg text-lg text-zinc-400">Placar completo, mapa de abates e ranking com os amigos, importados direto da Steam. Sem instalar nada.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={go} className={`${s.btn} flex items-center gap-2 bg-primary px-5 py-2.5 font-medium text-white`}>Entrar com Steam<ArrowRight className="h-4 w-4" /></button>
          <button className={`${s.btn} border border-white/10 px-5 py-2.5 text-zinc-300`}>Ver smokes por mapa</button>
        </div>
        <p className={`mt-6 text-xs text-zinc-500 ${v === 'b' ? 'font-mono' : ''}`}>Grátis · não pedimos sua senha · seus dados ficam só com você e o seu grupo</p>
      </div>
      <div className="relative">
        <div className="absolute -inset-8 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative space-y-3">
          <Card v={v} className="p-4">
            <div className="flex items-center gap-3"><span className={`h-10 w-16 bg-cover bg-center ${v === 'a' ? 'rounded-md' : 'rounded-[2px]'}`} style={{ backgroundImage: `url(${thumb('de_mirage')})` }} />
              <div><p className="font-medium">Mirage</p><p className="text-xs text-zinc-500">Premier · 22 rounds</p></div>
              <div className="ml-auto text-right"><p className={`text-2xl ${s.num}`}><span className="text-emerald-400">13</span><span className="text-zinc-600"> : </span>9</p><Result v={v} sf={13} sa={9} /></div></div>
            <div className="mt-4 grid grid-cols-4 gap-2">{[['Rating', '0,94', ''], ['K/D/A', '19/14/4', ''], ['ADR', '64', ''], ['Premier', '+444', 'text-emerald-400']].map(([l, n, t]) =>
              <div key={l}><p className={s.label}>{l}</p><p className={`mt-1 ${s.num} ${t || 'text-zinc-100'}`}>{n}</p></div>)}</div>
          </Card>
          <div className="ml-10"><KillMap v={v} /></div>
        </div>
      </div>
    </section>
    <section className="mx-auto grid max-w-6xl gap-3 px-4 pb-20 sm:grid-cols-2 md:px-8 lg:grid-cols-4">{features.map(([Icon, t, d]) =>
      <Card key={t} v={v} className="p-5"><Icon className="h-5 w-5 text-primary" /><p className={`mt-4 font-medium ${v === 'b' ? 'font-mono text-sm uppercase tracking-wider' : ''}`}>{t}</p><p className="mt-1.5 text-sm text-zinc-400">{d}</p></Card>)}</section>
  </div>;
}

// ---------- página ----------

export default function DesignPreview() {
  const [v, setV] = useState<V>('a');
  const [screen, setScreen] = useState<Screen>('partidas');
  const grid = v === 'b' ? { backgroundImage: 'linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px)', backgroundSize: '32px 32px' } : undefined;
  return <div className={`${ui(v).page} min-h-screen pb-28 font-sans text-zinc-100`} style={grid}>
    {screen === 'inicio' ? <Inicio v={v} go={() => setScreen('partidas')} />
      : <Shell v={v} screen={screen}>{screen === 'partidas' ? <Partidas v={v} open={() => setScreen('partida')} /> : <Partida v={v} />}</Shell>}
    <div aria-label="Seletor da prévia" role="toolbar" className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-3">
      <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-white/15 bg-black/85 p-1.5 text-sm shadow-2xl backdrop-blur">
        {([['a', 'A · Produto'], ['b', 'B · Produto + tático']] as [V, string][]).map(([k, l]) =>
          <button key={k} onClick={() => setV(k)} className={`rounded-xl px-3 py-1.5 ${v === k ? 'bg-primary text-white' : 'text-zinc-400'}`}>{l}</button>)}
        <span className="mx-1 h-5 w-px bg-white/15" />
        {([['inicio', 'Início'], ['partidas', 'Partidas'], ['partida', 'Partida']] as [Screen, string][]).map(([k, l]) =>
          <button key={k} onClick={() => setScreen(k)} className={`rounded-xl px-3 py-1.5 ${screen === k ? 'bg-white/15 text-white' : 'text-zinc-400'}`}>{l}</button>)}
      </div>
    </div>
  </div>;
}
