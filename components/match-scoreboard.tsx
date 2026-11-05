import { useState } from 'react';
import { AimMetric, MatchDetail, PlayerStats, ReplayStats } from '@/lib/services/tracking.service';
import { hubRating } from '@/lib/match';

type Column = {
  label: string; name: string; description: string; unit?: string; precision?: number; low?: boolean; signed?: boolean;
  value: (p: PlayerStats, s?: ReplayStats) => number | null | undefined;
  count?: (s?: ReplayStats) => number | undefined;
};
const accuracy: Column = { label: 'Precisão', name: 'Precisão', description: 'Disparos que acertaram um inimigo / disparos feitos durante os rounds.', unit: '%',
  value: (_, s) => s?.shots ? 100 * s.hits / s.shots : null, count: s => s?.shots };
const scoreboard: Column[] = [
  { label: 'Rank', name: 'Rank', description: 'Rank registrado na demo.', value: (_, s) => s?.rank },
  { label: 'K', name: 'Abates', description: 'Eliminações.', value: p => p.kills },
  { label: 'D', name: 'Mortes', description: 'Mortes.', low: true, value: p => p.deaths },
  { label: 'A', name: 'Assist.', description: 'Assistências.', value: p => p.assists },
  { label: '+/−', name: 'Saldo', description: 'Abates menos mortes.', signed: true, value: p => p.kills - p.deaths },
  { label: 'K/D', name: 'K/D', description: 'Abates por morte.', precision: 2, value: p => p.deaths ? p.kills / p.deaths : null },
  { label: 'ADR', name: 'ADR', description: 'Dano médio por round.', value: p => p.damage != null && p.rounds ? p.damage / p.rounds : null },
  { label: 'HS', name: 'HS', description: 'Abates com tiro na cabeça / abates.', unit: '%', value: p => p.headshots != null && p.kills ? 100*p.headshots/p.kills : null },
  accuracy,
  { label: 'KAST', name: 'KAST', description: 'Rounds em que o jogador matou, deu assistência, sobreviveu ou teve a morte vingada em até 5 s.', unit: '%', value: (p,s) => s && p.rounds ? 100*s.kast/p.rounds : null },
  { label: 'Cegou', name: 'Cegou', description: 'Inimigos cegados por pelo menos 1 s (cada flash conta).', value: (_,s) => s?.flashed },
  { label: 'Abertura', name: 'Abertura', description: 'Primeiros abates do round menos primeiras mortes do round.', signed: true, value: (_,s) => s?.opening },
  { label: 'Clutch', name: 'Clutch', description: 'Rounds vencidos depois de ficar sozinho contra um ou mais adversários.', value: (_,s) => s?.clutch },
  { label: '3K+', name: '3K+', description: 'Rounds com três ou mais abates.', value: (_,s) => s?.multi },
];
function contact(key: AimMetric, label: string, name: string, description: string, unit: string): Column {
  return { label, name, description, unit, precision: unit === '°' ? 1 : 2, low: true,
    value: (_, s) => s?.aim[key]?.mean, count: s => s?.aim[key]?.n };
}
const aimColumns = [
  contact('preaim', 'Preaim', 'Preaim', 'Distância, em graus, entre a mira e a cabeça do inimigo quando ele aparece. Menor é melhor.', '°'),
  contact('tts', 'Atirar', 'Até atirar', 'Tempo entre ver o inimigo e dar o primeiro tiro.', ' s'),
  contact('ttd', 'Dano', 'Até o dano', 'Tempo entre ver o inimigo e acertar o primeiro dano.', ' s'),
  contact('ttk', 'Abate', 'Até o abate', 'Tempo entre ver o inimigo e matá-lo.', ' s'), accuracy,
];

function format(c: Column, v: number | null | undefined) {
  if (v == null) return '—';
  return v.toLocaleString('pt-BR', { maximumFractionDigits: c.precision ?? 1, minimumFractionDigits: c.label === 'Rating' ? 2 : 0,
    signDisplay: c.signed ? 'exceptZero' : 'auto' }) + (c.unit ?? '');
}

export function MatchScoreboard({ match, viewer }: { match: MatchDetail; viewer?: string }) {
  const [aim, setAim] = useState(false);
  const [sort, setSort] = useState({ index: 0, ascending: false });
  const rating: Column = {
    label: 'Rating', name: 'Rating', precision: 2,
    description: 'Desempenho comparado à média dos jogadores desta partida (1,00). Pesa 50% abates, 35% dano e 15% assistências.',
    value: p => hubRating(p, match.players),
  };
  const premier: Column[] = match.analysis?.premier ? [
    { label: 'Premier', name: 'Premier', description: 'Pontos de Premier ao fim da partida.', value: (_,s) => s?.premierAfter },
    { label: '± Premier', name: '± Premier', signed: true, description: 'Pontos ganhos ou perdidos na partida. Traço quando a demo não informou.', value: (_,s) => s?.premierDelta },
  ] : [scoreboard[0]];
  const columns = aim ? aimColumns : [rating, ...premier, ...scoreboard.slice(1)];
  const column = columns[sort.index];
  const stats = (p: PlayerStats) => match.analysis?.players[p.steamId];
  function choose(view: boolean) {
    setAim(view);
    setSort(view ? { index: 2, ascending: true } : { index: 0, ascending: false });
  }
  const cell = (c: Column, p: PlayerStats) => {
    const count = c.count?.(stats(p));
    return <>{format(c, c.value(p, stats(p)))}{aim && count != null && <small className="block text-[11px] font-normal text-muted-foreground">{count}</small>}</>;
  };
  // No celular, K, D, A, saldo e K/D (derivados) viram uma célula só: três linhas por jogador.
  const merged = ['K', 'D', 'A', '+/−', 'K/D'];
  const kda: Column = { label: 'K/D/A', name: 'K / D / A', description: '', value: () => null };
  const cardColumns = aim ? columns : [columns[0], kda, ...columns.slice(1).filter(c => !merged.includes(c.label))];
  return <section className="min-w-0 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex rounded-lg border border-border p-1">
        {['Placar', 'Mira'].map((label, i) => <button type="button" key={label} aria-pressed={aim === !!i}
          onClick={() => choose(!!i)} className={`rounded-md px-4 py-1.5 text-sm font-medium ${aim === !!i ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{label}</button>)}
      </div>
      <label className="lg:hidden flex items-center gap-2 text-sm text-muted-foreground">Ordenar por
        <select className="bg-card border border-border rounded-md px-2 py-1.5 text-foreground" value={sort.index}
          onChange={e => { const i = Number(e.target.value); setSort({ index: i, ascending: !!columns[i].low }); }}>
          {columns.map((c, i) => <option key={c.label} value={i}>{c.name}</option>)}
        </select></label>
    </div>
    {aim && <p className="text-sm text-muted-foreground">Médias por duelo. O número pequeno é quantos duelos entraram na conta (em Precisão, quantos tiros).</p>}
    {!match.analysis && <p role="status" className="text-sm text-muted-foreground">Esta demo não tem os dados detalhados; só o placar básico.</p>}
    {[0, 1].map(team => {
      const players = match.players.filter(p => p.team === team).sort((a,b) => {
        const x = column.value(a,stats(a)), y = column.value(b,stats(b));
        if (x == null || y == null) return Number(x == null) - Number(y == null);
        return sort.ascending ? x-y : y-x;
      });
      const first = players[0];
      if (!first) return null;
      const win = first.scoreFor > first.scoreAgainst, draw = first.scoreFor === first.scoreAgainst;
      const mine = players.some(p => p.steamId === viewer);
      return <section key={team} className="rounded-xl border border-border overflow-hidden">
        <header className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-card px-4 py-3">
          <strong className="text-2xl tabular-nums">{first.scoreFor}</strong><h3 className="font-semibold">{mine ? 'Seu time' : `Time ${team+1}`}</h3>
          <span className={`text-xs ${draw ? 'text-muted-foreground' : win ? 'text-emerald-400' : 'text-red-400'}`}>{draw ? 'Empate' : win ? 'Vitória' : 'Derrota'}</span>
          <div className="ml-auto flex flex-wrap gap-2 text-xs">{match.analysis?.segments.map((s,i) => <span key={i} title={(s.sideA === 3) !== !!team ? 'Rounds vencidos de CT' : 'Rounds vencidos de TR'} className="rounded border border-border px-2 py-1">
            {(s.sideA === 3) !== !!team ? 'CT' : 'TR'} {s.wins[team]}</span>)}</div>
        </header>
        <ul className="lg:hidden divide-y divide-border">{players.map(p => <li key={p.steamId} className="px-4 py-3">
          <p className={`font-medium truncate ${p.steamId === viewer ? 'text-primary' : ''}`} title={p.name}>{p.name}</p>
          <dl className="mt-2 grid grid-cols-4 gap-x-2 gap-y-2 tabular-nums">{cardColumns.map(c => <div key={c.label} className={`rounded px-1.5 py-1 ${c === column || (c === kda && merged.includes(column.label)) ? 'bg-muted/60' : ''}`}>
            <dt className="text-[11px] text-muted-foreground truncate">{c.name}</dt><dd className="text-sm font-semibold">{c === kda ? `${p.kills}/${p.deaths}/${p.assists}` : cell(c, p)}</dd></div>)}</dl>
        </li>)}</ul>
        <div className="hidden lg:block overflow-x-auto"><table className="w-full text-sm tabular-nums">
          <thead className="text-xs text-muted-foreground"><tr><th scope="col" className="sticky left-0 bg-background p-3 text-left">Jogador</th>
            {columns.map((c,i) => <th scope="col" key={c.label} aria-sort={sort.index !== i ? 'none' : sort.ascending ? 'ascending' : 'descending'}>
              <button title={c.description} onClick={() => setSort({ index:i, ascending:sort.index === i ? !sort.ascending : !!c.low })}
                className="whitespace-nowrap px-2 py-3">{c.label}{sort.index === i ? (sort.ascending ? ' ↑' : ' ↓') : ''}</button></th>)}</tr></thead>
          <tbody>{players.map(p => <tr key={p.steamId} className="border-t border-border">
            <th scope="row" className={`sticky left-0 bg-background px-3 py-2.5 text-left font-medium ${p.steamId === viewer ? 'text-primary' : ''}`}><span className="block max-w-40 truncate" title={p.name}>{p.name}</span></th>
            {columns.map((c,i) => <td key={c.label} className={`px-2 py-2 text-center whitespace-nowrap ${i === sort.index ? 'bg-muted/50 font-semibold' : ''}`}>{cell(c, p)}</td>)}
          </tr>)}</tbody>
        </table></div></section>;
    })}
    <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">O que significa cada coluna</summary>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">{columns.map(c => <div key={c.label}><dt className="font-semibold text-foreground">{c.name}</dt><dd>{c.description}</dd></div>)}</dl></details>
  </section>;
}
