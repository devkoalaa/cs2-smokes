'use client';

import { useState } from 'react';
import { ArrowRight, Bell, ChevronRight, Crosshair, Home, ImageIcon, LayoutGrid, Map as MapIcon, Plus, Radar, Settings, Share2, Swords, Trophy, UserRound, Users } from 'lucide-react';
import { MARK } from '@/lib/brand';
import { mapName } from '@/lib/match';
import { RADARS, toRadar } from '@/lib/radar';
import data from './data.json';

// Prévia da direção "NextPlay": grafite, vermelho carmim nas ações, pílulas coloridas,
// arte dos mapas em tudo e entrada em sequência. Partida real; nomes de terceiros fictícios.

type Screen = 'inicio' | 'partidas' | 'partida' | 'visitante';
type Player = (typeof data.match.players)[number];

const MATCH = data.match, HISTORY = data.history;
const ME = MATCH.players.find(p => p.id === 'me')!;
const RED = '#e11d48';
const art = (map: string, small = false) => `/images/maps/art/${map.replace('de_', '')}${small ? '-sm' : ''}.webp`;
const fmt = (n: number | null | undefined, d = 0) => n == null ? '—' : n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const when = (s: string) => new Date(s).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace('.', '');
const total = MATCH.players.reduce((s, p) => ({ k: s.k + p.k, a: s.a + p.a, dmg: s.dmg + (p.dmg ?? 0) }), { k: 0, a: 0, dmg: 0 });
const rating = (p: Player) => (0.5 * p.k / total.k + 0.35 * (p.dmg ?? 0) / total.dmg + 0.15 * p.a / total.a) * MATCH.players.length;
const tone = (r: number | null) => r == null ? 'text-zinc-500' : r >= 1.1 ? 'text-emerald-400' : r < 0.9 ? 'text-rose-400' : 'text-zinc-100';

// Entrada em sequência (como nos vídeos de referência).
const rise = (i: number): React.CSSProperties => ({ animation: 'nprise .55s cubic-bezier(.2,.8,.2,1) both', animationDelay: `${i * 70}ms` });

function Logo({ size = 32 }: { size?: number }) {
  return <span className="flex shrink-0 items-center justify-center rounded-lg" style={{ width: size, height: size, background: RED }}>
    <svg viewBox={MARK.viewBox} width={size * 0.7} height={size * 0.7} aria-hidden="true">
      <g fill="none" stroke="#fff" strokeWidth={MARK.strokeWidth} strokeLinecap="round" strokeLinejoin="round">{MARK.paths.map(d => <path key={d} d={d} />)}</g>
      <circle {...MARK.dot} fill="#fff" />
    </svg>
  </span>;
}

function Wordmark() {
  return <div className="flex items-center gap-2.5"><Logo /><span className="text-lg font-black italic tracking-tight">CS2<span className="ml-1 rounded-[4px] px-1.5 py-0.5 not-italic text-white" style={{ background: RED }}>HUB</span></span></div>;
}

const Pill = ({ kind, children }: { kind: 'premier' | 'good' | 'dark' | 'live' | 'bad'; children: React.ReactNode }) => {
  const cls = { premier: 'bg-violet-600 text-white', good: 'bg-emerald-500 text-emerald-950', dark: 'bg-black/50 text-zinc-300 ring-1 ring-white/10', live: 'bg-amber-500 text-amber-950', bad: 'bg-rose-500/20 text-rose-300' }[kind];
  return <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${cls}`}>{kind === 'premier' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}{children}</span>;
};

const RedButton = ({ children, full = false, className = '' }: { children: React.ReactNode; full?: boolean; className?: string }) =>
  <button className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 transition hover:brightness-110 ${full ? 'w-full' : ''} ${className}`} style={{ background: RED }}>{children}</button>;

const Panel = ({ className = '', style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) =>
  <div className={`rounded-xl bg-[#1b1c21] ring-1 ring-white/[0.06] ${className}`} style={style}>{children}</div>;

// ---------- casca ----------

function Shell({ screen, go, children }: { screen: Screen; go: (s: Screen) => void; children: React.ReactNode }) {
  const menu: [string, React.ElementType, Screen | null][] = [['Início', Home, 'inicio'], ['Partidas', LayoutGrid, 'partidas'], ['Smokes', MapIcon, null], ['Grupos', Users, null], ['Ranking', Trophy, null]];
  const conta: [string, React.ElementType][] = [['Perfil', UserRound], ['Conexão Steam', Crosshair], ['Configurações', Settings]];
  const active = screen === 'partida' ? 'partidas' : screen;
  const groups = [['SQ', '#e11d48'], ['FA', '#7c3aed'], ['5V', '#0ea5e9']];
  return <div className="mx-auto max-w-[1400px] p-0 md:p-4">
    <div className="overflow-hidden bg-[#121317] md:rounded-2xl md:ring-1 md:ring-white/[0.07]">
      <header className="flex items-center gap-4 border-b border-white/[0.05] px-4 py-3">
        <Wordmark />
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-sm font-semibold ring-1 ring-white/[0.06] sm:flex"><span className="h-2.5 w-2.5 rounded-full bg-violet-500 ring-2 ring-violet-500/30" />3.183</span>
          <button className="rounded-lg p-2 text-zinc-400 ring-1 ring-white/[0.06]"><Bell className="h-4 w-4" /></button>
          <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-zinc-500 to-zinc-800 ring-1 ring-white/10" />
        </div>
      </header>
      <div className="flex">
        <div className="hidden w-14 shrink-0 flex-col items-center gap-2 border-r border-white/[0.05] py-3 md:flex">
          {groups.map(([g, c]) => <span key={g} className="flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-black text-white" style={{ background: c }}>{g}</span>)}
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-white/15 text-zinc-500"><Plus className="h-4 w-4" /></span>
        </div>
        <aside className="hidden w-48 shrink-0 border-r border-white/[0.05] p-3 lg:block">
          <p className="px-2 text-xs font-semibold text-zinc-500">Menu</p>
          <nav className="mt-2 space-y-0.5">{menu.map(([label, Icon, target]) => {
            const on = target === active;
            return <button key={label} onClick={() => target && go(target)} className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition ${on ? 'bg-white/[0.07] font-semibold text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
              <Icon className="h-4 w-4" style={on ? { color: RED } : undefined} />{label}</button>;
          })}</nav>
          <p className="mt-6 px-2 text-xs font-semibold text-zinc-500">Conta</p>
          <nav className="mt-2 space-y-0.5">{conta.map(([label, Icon]) => <span key={label} className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-zinc-400"><Icon className="h-4 w-4" />{label}</span>)}</nav>
        </aside>
        <main className="min-w-0 flex-1 space-y-4 p-3 md:p-4">{children}</main>
      </div>
    </div>
  </div>;
}

// ---------- cards ----------

function MatchCard({ m, i, open }: { m: (typeof HISTORY)[number]; i: number; open: () => void }) {
  const win = m.sf > m.sa;
  return <div className="group overflow-hidden rounded-xl bg-[#1b1c21] ring-1 ring-white/[0.06] transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 hover:ring-white/15" style={rise(i)}>
    <div className="relative h-36 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${art(m.map, true)})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1b1c21] via-transparent to-transparent" />
      <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[11px] font-bold uppercase text-white backdrop-blur">{m.mode === 'wingman' ? '2×2' : '5×5'}</span>
    </div>
    <div className="space-y-2.5 p-3.5 pt-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill kind={win ? 'good' : 'bad'}>{win ? 'Vitória' : 'Derrota'}</Pill>
        {m.delta != null && <Pill kind="premier">{m.delta > 0 ? '+' : ''}{m.delta}</Pill>}
        <span className="ml-auto text-[11px] font-semibold uppercase text-zinc-500">{when(m.playedAt)}</span>
      </div>
      <p className="text-lg font-bold capitalize leading-tight">{mapName(m.map)} <span className="text-zinc-500">·</span> <span className="tabular-nums">{m.sf}:{m.sa}</span></p>
      <p className="text-sm text-zinc-400 tabular-nums">{m.k}/{m.d}/{m.a} · ADR {m.adr} · HS {m.hs}% · Rating <span className={`font-semibold ${tone(m.rating)}`}>{fmt(m.rating, 2)}</span></p>
      <div onClick={open}><RedButton full>Ver placar</RedButton></div>
    </div>
  </div>;
}

// ---------- Início (logado) ----------

function Inicio({ go }: { go: (s: Screen) => void }) {
  const last = HISTORY[1];
  return <>
    <div className="relative overflow-hidden rounded-xl ring-1 ring-white/[0.06]" style={rise(0)}>
      <div className="h-72 bg-cover bg-center md:h-80" style={{ backgroundImage: `url(${art(last.map)})` }} />
      <span className="absolute right-3 top-3"><Pill kind="live">Última partida</Pill></span>
      <div className="absolute inset-x-3 bottom-3 rounded-xl bg-[#16171b]/95 p-3.5 ring-1 ring-white/[0.08] backdrop-blur md:inset-x-4 md:bottom-4">
        <div className="flex items-center gap-3"><Logo size={28} /><div><p className="font-bold">Vitória na Mirage · 13:9</p><p className="text-sm text-zinc-400">Você fez 19/14/4 e subiu 444 pontos de Premier.</p></div></div>
        <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-3">
          {[['Modo', 'Premier 5×5'], ['Rounds', '22'], ['Rating', '0,94'], ['ADR', '64']].map(([l, v]) => <div key={l}><p className="text-[11px] text-zinc-500">{l}</p><p className="text-sm font-semibold">{v}</p></div>)}
          <div className="ml-auto flex items-center gap-3"><Pill kind="premier">+444</Pill><span onClick={() => go('partida')}><RedButton>Ver partida<ArrowRight className="h-4 w-4" /></RedButton></span></div>
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between pt-2"><h2 className="text-lg font-bold">Últimas partidas</h2><button onClick={() => go('partidas')} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white">Ver todas<ChevronRight className="h-4 w-4" /></button></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{HISTORY.slice(2, 5).map((m, i) => <MatchCard key={m.id} m={m} i={i + 1} open={() => go('partida')} />)}</div>
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel className="p-4" style={rise(4)}>
        <div className="flex items-center justify-between"><h2 className="font-bold">Ranking · Squad da quinta</h2><Pill kind="dark">30 dias</Pill></div>
        <ul className="mt-3 space-y-2">{([['Tigrão', 1.09, '5 partidas'], ['Lobo', 1.02, '8 partidas'], ['koala', 0.76, '8 partidas']] as [string, number, string][]).map(([n, r, p], i) =>
          <li key={n} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${n === 'koala' ? 'bg-rose-500/[0.08] ring-1 ring-rose-500/20' : 'bg-white/[0.03]'}`}>
            <span className="w-5 text-center font-black text-zinc-500">{i + 1}</span><span className="h-8 w-8 rounded-lg bg-gradient-to-br from-zinc-500 to-zinc-800" />
            <span className="flex-1"><span className="block font-semibold">{n}</span><span className="text-xs text-zinc-500">{p}</span></span>
            <span className={`text-lg font-bold tabular-nums ${tone(r)}`}>{fmt(r, 2)}</span></li>)}</ul>
      </Panel>
      <Panel className="p-4" style={rise(5)}>
        <div className="flex items-center justify-between"><h2 className="font-bold">Seus mapas</h2><Pill kind="dark">vitórias</Pill></div>
        <div className="mt-3 grid grid-cols-2 gap-2">{[['de_mirage', '1 de 3'], ['de_nuke', '1 de 2'], ['de_ancient', '1 de 1'], ['de_vertigo', '1 de 1']].map(([m, w]) =>
          <div key={m} className="group relative h-20 overflow-hidden rounded-lg"><div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${art(m, true)})` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 to-black/10" /><div className="relative p-3"><p className="font-bold capitalize">{mapName(m)}</p><p className="text-xs text-zinc-300">{w} vitórias</p></div></div>)}</div>
      </Panel>
    </div>
  </>;
}

// ---------- Partidas ----------

function Partidas({ go }: { go: (s: Screen) => void }) {
  return <>
    <div className="flex flex-wrap items-end justify-between gap-3" style={rise(0)}>
      <div><h1 className="text-2xl font-bold">Partidas</h1><p className="text-sm text-zinc-500">8 partidas · últimos 30 dias</p></div>
      <div className="flex flex-wrap gap-1.5">{['Todas', 'Premier', 'Competitivo', 'Duplas'].map((t, i) =>
        <span key={t} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${i === 0 ? 'text-white' : 'bg-white/[0.04] text-zinc-400 ring-1 ring-white/[0.06]'}`} style={i === 0 ? { background: RED } : undefined}>{t}</span>)}</div>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4" style={rise(1)}>{[['Rating', '0,76', 'text-rose-400'], ['Vitórias', '50%', ''], ['K/D', '0,81', ''], ['ADR', '57,7', '']].map(([l, v, t]) =>
      <Panel key={l} className="p-4"><p className="text-xs text-zinc-500">{l}</p><p className={`mt-1 text-2xl font-bold tabular-nums ${t}`}>{v}</p></Panel>)}</div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{HISTORY.map((m, i) => <MatchCard key={m.id} m={m} i={i + 2} open={() => go('partida')} />)}</div>
  </>;
}

// ---------- Partida ----------

function Scoreboard({ team, label, win }: { team: Player[]; label: string; win: boolean }) {
  return <Panel className="overflow-hidden">
    <div className="flex items-center gap-3 px-4 py-3"><span className="text-2xl font-black tabular-nums">{team[0].sf}</span><p className="font-bold">{label}</p><Pill kind={win ? 'good' : 'bad'}>{win ? 'Vitória' : 'Derrota'}</Pill></div>
    <div className="overflow-x-auto"><table className="w-full text-sm tabular-nums">
      <thead><tr className="bg-black/20 text-xs text-zinc-500">{['Jogador', 'Rating', 'K', 'D', 'A', 'ADR', 'HS', 'KAST'].map((h, i) =>
        <th key={h} className={`px-3 py-2 font-medium ${i === 0 ? 'pl-4 text-left' : 'text-right'} ${i >= 6 ? 'hidden md:table-cell' : ''}`}>{h}</th>)}</tr></thead>
      <tbody>{[...team].sort((a, b) => rating(b) - rating(a)).map(p => { const r = rating(p), me = p.id === 'me';
        return <tr key={p.id} className={`border-t border-white/[0.04] ${me ? 'bg-rose-500/[0.07]' : ''}`}>
          <td className="py-2.5 pl-4 pr-3"><div className="flex items-center gap-2.5"><span className="h-7 w-7 shrink-0 rounded-md bg-gradient-to-br from-zinc-500 to-zinc-800" /><span className={`font-semibold ${me ? 'text-rose-300' : ''}`}>{p.name}</span></div></td>
          <td className={`px-3 py-2.5 text-right font-bold ${tone(r)}`}>{fmt(r, 2)}</td>
          {[p.k, p.d, p.a].map((n, i) => <td key={i} className="px-3 py-2.5 text-right text-zinc-300">{n}</td>)}
          <td className="px-3 py-2.5 text-right text-zinc-300">{Math.round((p.dmg ?? 0) / MATCH.rounds)}</td>
          <td className="hidden px-3 py-2.5 text-right text-zinc-300 md:table-cell">{p.k ? Math.round(100 * (p.hs ?? 0) / p.k) : 0}%</td>
          <td className="hidden px-3 py-2.5 text-right text-zinc-300 md:table-cell">{Math.round(100 * (p.kast ?? 0) / MATCH.rounds)}%</td>
        </tr>; })}</tbody>
    </table></div>
  </Panel>;
}

function KillMap() {
  const radar = RADARS[MATCH.map];
  const mine = MATCH.kills.filter(k => k.attacker === 'me' && k.attackerPos && k.victimPos);
  return <Panel className="p-4">
    <div className="flex items-center justify-between"><h2 className="font-bold">Mapa de abates</h2><Pill kind="dark">{mine.length} abates</Pill></div>
    <div className="relative mt-3 aspect-square overflow-hidden rounded-lg bg-black/40">
      <svg viewBox="150 120 700 700" className="absolute inset-0 h-full w-full">
        <image href={radar.image} x={0} y={0} width={1024} height={1024} />
        {mine.map((k, i) => { const a = toRadar(radar, k.attackerPos!), b = toRadar(radar, k.victimPos!);
          return <g key={i}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="white" strokeOpacity="0.4" strokeWidth="2.5" strokeDasharray="7 5" />
            <path d={`M${b.x - 7} ${b.y - 7}L${b.x + 7} ${b.y + 7}M${b.x + 7} ${b.y - 7}L${b.x - 7} ${b.y + 7}`} stroke="#fb7185" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={a.x} cy={a.y} r="10" fill={k.attackerSide === 'CT' ? '#38bdf8' : '#fbbf24'} stroke="#000" strokeWidth="3" /></g>; })}
      </svg>
    </div>
  </Panel>;
}

function Partida() {
  const mine = MATCH.players.filter(p => p.team === ME.team), them = MATCH.players.filter(p => p.team !== ME.team);
  return <>
    <div className="relative overflow-hidden rounded-xl ring-1 ring-white/[0.06]" style={rise(0)}>
      <div className="h-60 bg-cover bg-center md:h-72" style={{ backgroundImage: `url(${art(MATCH.map)})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#121317] via-[#121317]/40 to-transparent" />
      <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-4">
        <div><div className="flex gap-1.5"><Pill kind="premier">Premier</Pill><Pill kind="dark">5×5 · 22 rounds</Pill></div>
          <h1 className="mt-2 text-4xl font-black">Mirage</h1><p className="text-sm text-zinc-300">{when(MATCH.playedAt)}</p></div>
        <div className="flex items-center gap-4 rounded-xl bg-[#16171b]/90 px-5 py-3 ring-1 ring-white/[0.08] backdrop-blur">
          <div className="text-center"><p className="text-[11px] text-zinc-400">Seu time</p><p className="text-4xl font-black tabular-nums text-emerald-400">13</p></div>
          <span className="text-2xl text-zinc-600">:</span>
          <div className="text-center"><p className="text-[11px] text-zinc-400">Adversário</p><p className="text-4xl font-black tabular-nums">9</p></div>
        </div>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2" style={rise(1)}>
      <RedButton><Share2 className="h-4 w-4" />Compartilhar</RedButton>
      <button className="inline-flex items-center gap-2 rounded-lg bg-white/[0.05] px-4 py-2 text-sm font-semibold ring-1 ring-white/[0.08]"><ImageIcon className="h-4 w-4" />Copiar imagem do time</button>
      <div className="ml-auto flex gap-1.5">{MATCH.segments.map((seg, i) => { const ct = (seg.sideA === 3) !== !!ME.team;
        return <span key={i} className={`rounded-md px-2 py-1 text-xs font-bold ${ct ? 'bg-sky-500/15 text-sky-300' : 'bg-amber-500/15 text-amber-300'}`}>{ct ? 'CT' : 'TR'} {seg.wins[ME.team]}</span>; })}</div>
    </div>
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-4" style={rise(2)}><Scoreboard team={mine} label="Seu time" win /><Scoreboard team={them} label="Adversário" win={false} /></div>
      <div style={rise(3)}><KillMap /></div>
    </div>
  </>;
}

// ---------- Visitante ----------

function Visitante({ go }: { go: (s: Screen) => void }) {
  const features: [React.ElementType, string, string][] = [
    [Swords, 'Placar completo', 'Rating, ADR, KAST e Premier de todo mundo da partida.'],
    [Radar, 'Mapa de abates', 'Onde você matou e morreu, sobre o radar.'],
    [Trophy, 'Ranking com amigos', 'Crie um grupo e veja quem está carregando.'],
    [Crosshair, 'Smokes por mapa', 'Granadas com vídeo e posição exata.'],
  ];
  return <div className="mx-auto max-w-[1400px] md:p-4">
    <div className="relative overflow-hidden bg-[#121317] md:rounded-2xl md:ring-1 md:ring-white/[0.07]">
      <div className="absolute inset-0 grid grid-cols-3 opacity-40">{['de_mirage', 'de_nuke', 'de_ancient'].map(m => <div key={m} className="bg-cover bg-center" style={{ backgroundImage: `url(${art(m)})` }} />)}</div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#121317]/70 via-[#121317]/90 to-[#121317]" />
      <header className="relative flex items-center gap-3 px-5 py-4"><Wordmark /><button onClick={() => go('inicio')} className="ml-auto rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-black">Entrar com Steam</button></header>
      <section className="relative px-5 pb-10 pt-16 text-center md:pt-28">
        <div style={rise(0)}><Pill kind="live">Beta aberto · vagas limitadas</Pill></div>
        <h1 className="mx-auto mt-5 max-w-3xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl" style={rise(1)}>Suas partidas de CS2, <span style={{ color: RED }}>explicadas.</span></h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-300" style={rise(2)}>Placar completo, mapa de abates e ranking com os amigos, importados direto da Steam.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3" style={rise(3)}><span onClick={() => go('inicio')}><RedButton className="px-6 py-3 text-base">Entrar com Steam<ArrowRight className="h-4 w-4" /></RedButton></span>
          <button className="rounded-lg bg-white/[0.06] px-6 py-3 font-semibold ring-1 ring-white/10">Ver smokes</button></div>
      </section>
      <section className="relative grid gap-3 px-5 pb-10 sm:grid-cols-2 lg:grid-cols-4">{features.map(([Icon, t, d], i) =>
        <Panel key={t} className="p-5 transition hover:-translate-y-1" style={rise(4 + i)}><span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${RED}26`, color: RED }}><Icon className="h-5 w-5" /></span>
          <p className="mt-4 font-bold">{t}</p><p className="mt-1 text-sm text-zinc-400">{d}</p></Panel>)}</section>
    </div>
  </div>;
}

// ---------- página ----------

export default function DesignPreview() {
  const [screen, setScreen] = useState<Screen>('inicio');
  return <div className="min-h-screen pb-28 font-sans text-zinc-100" style={{ background: 'radial-gradient(ellipse at top, #4c0519 0%, #1a0a0f 45%, #0b0b0e 100%)' }}>
    <style>{'@keyframes nprise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}'}</style>
    <div key={screen}>{screen === 'visitante' ? <Visitante go={setScreen} />
      : <Shell screen={screen} go={setScreen}>{screen === 'inicio' ? <Inicio go={setScreen} /> : screen === 'partidas' ? <Partidas go={setScreen} /> : <Partida />}</Shell>}</div>
    <div aria-label="Seletor da prévia" role="toolbar" className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-3">
      <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-white/15 bg-black/85 p-1.5 text-sm shadow-2xl backdrop-blur">
        {([['inicio', 'Início'], ['partidas', 'Partidas'], ['partida', 'Partida'], ['visitante', 'Visitante']] as [Screen, string][]).map(([k, l]) =>
          <button key={k} onClick={() => setScreen(k)} className={`rounded-xl px-3 py-1.5 ${screen === k ? 'text-white' : 'text-zinc-400'}`} style={screen === k ? { background: RED } : undefined}>{l}</button>)}
      </div>
    </div>
  </div>;
}
