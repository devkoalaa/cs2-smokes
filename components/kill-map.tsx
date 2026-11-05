import { useEffect, useMemo, useState } from 'react';
import { Kill, MatchDetail } from '@/lib/services/tracking.service';
import { isLower, RADARS, toRadar, weaponName } from '@/lib/radar';

type View = 'kills' | 'deaths';
const SIDE_COLOR = { CT: '#60a5fa', T: '#fbbf24' } as const;
const SIDE_LABEL = { CT: 'CT', T: 'TR' } as const;
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const select = 'bg-card border border-border rounded-md px-2 py-1.5 text-sm w-full';

// Onde cada abate aconteceu, sobre o radar do mapa. Em "Abates" o ponto é onde
// estava quem matou e o X é onde a vítima caiu; em "Mortes", o contrário.
export function KillMap({ match, viewer }: { match: MatchDetail; viewer?: string }) {
  const kills = match.analysis?.kills;
  const radar = RADARS[match.map];
  const players = useMemo(() => [...match.players].sort((a, b) => a.team - b.team || a.name.localeCompare(b.name)), [match.players]);
  const names = useMemo(() => Object.fromEntries(match.players.map(p => [p.steamId, p.name])), [match.players]);
  const [player, setPlayer] = useState(viewer && names[viewer] ? viewer : 'all');
  const [view, setView] = useState<View>('kills');
  const [side, setSide] = useState<'all' | 'CT' | 'T'>('all');
  const [round, setRound] = useState(0);
  const [lower, setLower] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const rows = useMemo(() => (kills ?? []).map((k, index) => {
    const main = view === 'kills' ? k.attackerPos : k.victimPos, other = view === 'kills' ? k.victimPos : k.attackerPos;
    return { ...k, index, main, other, subjectSide: view === 'kills' ? k.attackerSide : k.victimSide };
  }).filter(k => k.main
    && (view === 'deaths' || (k.attacker && k.attacker !== k.victim))
    && (player === 'all' || (view === 'kills' ? k.attacker : k.victim) === player)
    && (side === 'all' || k.subjectSide === side)
    && (!round || k.round === round)
    && (!radar?.lower || isLower(radar, k.main!) === lower)), [kills, view, player, side, round, lower, radar]);
  useEffect(() => setSelected(null), [view, player, side, round, lower]);
  // Zoom fixo na área onde houve mortes nesta partida (não muda com os filtros),
  // para radares com muita margem, como o da Nuke, não deixarem os pontos minúsculos.
  const box = useMemo(() => {
    const points = radar ? (kills ?? []).flatMap(k => [k.attackerPos, k.victimPos]).filter((p): p is number[] => !!p).map(p => toRadar(radar, p)) : [];
    if (!points.length) return { x: 0, y: 0, size: 1024 };
    const xs = points.map(p => p.x), ys = points.map(p => p.y);
    const size = Math.min(1024, Math.max(420, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) + 140);
    const clamp = (v: number) => Math.min(Math.max(v, 0), 1024 - size);
    return { x: clamp((Math.min(...xs) + Math.max(...xs) - size) / 2), y: clamp((Math.min(...ys) + Math.max(...ys) - size) / 2), size };
  }, [kills, radar]);
  const u = box.size / 1024; // marcadores com o mesmo tamanho na tela, com ou sem zoom

  const header = <div><h2 className="text-xl font-semibold">Mapa de abates</h2>
    <p className="text-sm text-muted-foreground mt-1">{view === 'kills' ? 'Bolinha: onde estava quem matou. X: onde a vítima caiu.' : 'Bolinha: onde morreu. X: de onde veio o tiro.'} Toque num ponto para ver o lance.</p></div>;
  if (!kills?.length) return <section className="rounded-xl border border-border p-4 md:p-5">{header}
    <p className="text-sm text-muted-foreground mt-4">Esta partida foi importada antes de o site guardar as posições, e a demo já não está mais disponível na Valve.</p></section>;
  if (!radar) return <section className="rounded-xl border border-border p-4 md:p-5">{header}
    <p className="text-sm text-muted-foreground mt-4 capitalize">Ainda não temos o radar de {match.map.replace(/^de_/, '')}.</p></section>;

  const rounds = Math.max(...kills.map(k => k.round));
  const current = selected === null ? null : kills[selected];
  const describe = (k: Kill) => {
    const who = k.attacker ? names[k.attacker] ?? '?' : null;
    return { title: k.attacker === k.victim || !who ? `${names[k.victim]} morreu (${weaponName(k.weapon)})` : `${who} matou ${names[k.victim]}`,
      detail: `Round ${k.round} · ${clock(k.time)} · ${weaponName(k.weapon)}${k.headshot ? ' · HS' : ''}` };
  };
  const hs = rows.filter(k => k.headshot).length;

  return <section className="rounded-xl border border-border p-4 md:p-5 space-y-4">
    {header}
    <div className="grid gap-5 lg:grid-cols-[minmax(0,620px)_1fr]">
      <div className="space-y-3 min-w-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select aria-label="Jogador" className={select} value={player} onChange={e => setPlayer(e.target.value)}>
            <option value="all">Todos os jogadores</option>
            {players.map(p => <option key={p.steamId} value={p.steamId}>{p.name}{p.steamId === viewer ? ' (você)' : ''}</option>)}
          </select>
          <select aria-label="Mostrar" className={select} value={view} onChange={e => setView(e.target.value as View)}>
            <option value="kills">Abates</option><option value="deaths">Mortes</option>
          </select>
          <select aria-label="Lado" className={select} value={side} onChange={e => setSide(e.target.value as typeof side)}>
            <option value="all">CT e TR</option><option value="CT">Só de CT</option><option value="T">Só de TR</option>
          </select>
          <select aria-label="Round" className={select} value={round} onChange={e => setRound(Number(e.target.value))}>
            <option value={0}>Todos os rounds</option>
            {Array.from({ length: rounds }, (_, i) => <option key={i} value={i + 1}>Round {i + 1}</option>)}
          </select>
        </div>
        {radar.lower && <div className="inline-flex rounded-lg border border-border p-1">
          {['Andar de cima', 'Andar de baixo'].map((label, i) => <button key={label} type="button" aria-pressed={lower === !!i} onClick={() => setLower(!!i)}
            className={`rounded-md px-3 py-1 text-sm ${lower === !!i ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{label}</button>)}
        </div>}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black/40">
          <svg viewBox={`${box.x} ${box.y} ${box.size} ${box.size}`} className="absolute inset-0 h-full w-full" role="img" aria-label={`Radar de ${match.map} com ${rows.length} pontos`}>
            <image href={lower && radar.lower ? radar.lower.image : radar.image} x={0} y={0} width={1024} height={1024} />
            {rows.map(k => {
              const a = toRadar(radar, k.main!), b = k.other && (!radar.lower || isLower(radar, k.other) === lower) ? toRadar(radar, k.other) : null;
              const on = selected === k.index, dim = selected !== null && !on;
              return <g key={k.index} opacity={dim ? 0.25 : 1} className="cursor-pointer" onClick={() => setSelected(on ? null : k.index)}>
                {b && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#fff" strokeOpacity={on ? 0.9 : 0.35} strokeWidth={(on ? 4 : 2) * u} strokeDasharray={`${8 * u} ${6 * u}`} />}
                {b && <path d={`M${b.x - 9 * u} ${b.y - 9 * u}L${b.x + 9 * u} ${b.y + 9 * u}M${b.x + 9 * u} ${b.y - 9 * u}L${b.x - 9 * u} ${b.y + 9 * u}`} stroke="#f87171" strokeWidth={(on ? 6 : 4) * u} strokeLinecap="round" />}
                <circle cx={a.x} cy={a.y} r={(on ? 18 : 13) * u} fill={k.subjectSide ? SIDE_COLOR[k.subjectSide] : '#a1a1aa'} stroke={on ? '#fff' : '#000'} strokeWidth={(on ? 5 : 3) * u} />
                <circle cx={a.x} cy={a.y} r={30 * u} fill="transparent" />
              </g>;
            })}
          </svg>
        </div>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: SIDE_COLOR.CT }} />CT</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: SIDE_COLOR.T }} />TR</span>
          <span className="flex items-center gap-1.5"><span className="font-bold text-red-400">✕</span>{view === 'kills' ? 'vítima' : 'quem matou'}</span>
        </p>
      </div>
      <div className="min-w-0 space-y-3">
        <p className="text-sm"><strong className="text-lg tabular-nums">{rows.length}</strong> {view === 'kills' ? (rows.length === 1 ? 'abate' : 'abates') : (rows.length === 1 ? 'morte' : 'mortes')}
          {view === 'kills' && rows.length > 0 && <span className="text-muted-foreground"> · {hs} de HS</span>}
          {radar.lower && <span className="text-muted-foreground"> neste andar</span>}</p>
        {current && <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm">
          <p className="font-semibold">{describe(current).title}</p><p className="text-muted-foreground mt-0.5">{describe(current).detail}</p></div>}
        <ul className="max-h-64 lg:max-h-[520px] overflow-y-auto divide-y divide-border rounded-lg border border-border text-sm">
          {!rows.length && <li className="p-3 text-muted-foreground">Nada com esses filtros.</li>}
          {rows.map(k => {
            const text = describe(k);
            return <li key={k.index}><button type="button" onClick={() => setSelected(selected === k.index ? null : k.index)}
              className={`w-full px-3 py-2 text-left hover:bg-card/60 ${selected === k.index ? 'bg-primary/15' : ''}`}>
              <span className="flex items-center gap-2"><span className="h-2 w-2 shrink-0 rounded-full" style={{ background: k.subjectSide ? SIDE_COLOR[k.subjectSide] : '#a1a1aa' }} />
                <span className="truncate">{text.title}</span></span>
              <span className="block text-xs text-muted-foreground pl-4">{text.detail}{k.subjectSide ? ` · ${SIDE_LABEL[k.subjectSide]}` : ''}</span>
            </button></li>;
          })}
        </ul>
      </div>
    </div>
  </section>;
}
