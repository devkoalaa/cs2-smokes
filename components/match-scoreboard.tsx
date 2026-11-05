import { useState } from 'react';
import { AimMetric, MatchDetail, PlayerStats, ReplayStats } from '@/lib/services/tracking.service';

type Column = {
  label: string; description: string; unit?: string; precision?: number; low?: boolean;
  value: (p: PlayerStats, s?: ReplayStats) => number | null | undefined;
  count?: (s?: ReplayStats) => number | undefined;
};
const accuracy: Column = { label: 'S. Acc', description: 'Disparos de arma de fogo com dano a inimigo no mesmo tick / disparos durante os rounds.', unit: '%',
  value: (_, s) => s?.shots ? 100 * s.hits / s.shots : null, count: s => s?.shots };
const scoreboard: Column[] = [
  { label: 'Rank', description: 'Valor de classificação registrado na demo.', value: (_, s) => s?.rank },
  { label: 'K', description: 'Eliminações', value: p => p.kills },
  { label: 'D', description: 'Mortes', low: true, value: p => p.deaths },
  { label: 'A', description: 'Assistências', value: p => p.assists },
  { label: '+/−', description: 'Eliminações menos mortes', value: p => p.kills - p.deaths },
  { label: 'K/D', description: 'Eliminações por morte', precision: 2, value: p => p.deaths ? p.kills / p.deaths : null },
  { label: 'ADR', description: 'Dano médio por round', value: p => p.damage != null && p.rounds ? p.damage / p.rounds : null },
  { label: 'HS', description: 'Eliminações por headshot / eliminações', unit: '%', value: p => p.headshots != null && p.kills ? 100*p.headshots/p.kills : null },
  accuracy,
  { label: 'KAST', description: 'Rounds com eliminação, assistência, sobrevivência ou morte trocada em até 5 s.', unit: '%', value: (p,s) => s && p.rounds ? 100*s.kast/p.rounds : null },
  { label: 'EF', description: 'Inimigos cegados por pelo menos 1 s (cada flash conta).', value: (_,s) => s?.flashed },
  { label: 'FK−FD', description: 'Primeiras eliminações menos primeiras mortes dos rounds.', value: (_,s) => s?.opening },
  { label: '1vX', description: 'Rounds vencidos após ficar sozinho contra pelo menos um adversário.', value: (_,s) => s?.clutch },
  { label: '3K+', description: 'Rounds com três ou mais eliminações.', value: (_,s) => s?.multi },
];
function contact(key: AimMetric, label: string, description: string, unit: string): Column {
  return { label, description, unit, precision: unit === '°' ? 1 : 2, low: true,
    value: (_, s) => s?.aim[key]?.mean, count: s => s?.aim[key]?.n };
}
const aimColumns = [
  contact('preaim', 'Preaim', 'Ângulo entre a mira e a posição estimada da cabeça do alvo no primeiro registro.', '°'),
  contact('tts', 'TTS', 'Tempo até o próximo disparo do jogador durante o contato, em qualquer direção.', ' s'),
  contact('ttd', 'TTD', 'Tempo até causar dano de arma de fogo ao adversário observado.', ' s'),
  contact('ttk', 'TTK', 'Tempo até eliminar com arma de fogo o adversário observado.', ' s'), accuracy,
];

export function MatchScoreboard({ match, viewer }: { match: MatchDetail; viewer?: string }) {
  const [aim, setAim] = useState(false);
  const [sort, setSort] = useState({ index: 1, ascending: false });
  const columns = aim ? aimColumns : scoreboard;
  const column = columns[sort.index];
  const stats = (p: PlayerStats) => match.analysis?.players[p.steamId];
  function choose(view: boolean) {
    setAim(view);
    setSort(view ? { index: 2, ascending: true } : { index: 1, ascending: false });
  }
  return <section className="min-w-0 space-y-4">
    <div className="inline-flex rounded-lg border border-border p-1">
      {['Placar', 'Mira'].map((label, i) => <button type="button" key={label} aria-pressed={aim === !!i}
        onClick={() => choose(!!i)} className={`rounded-md px-4 py-1.5 text-sm font-medium ${aim === !!i ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{label}</button>)}
    </div>
    {aim && <p className="text-sm text-muted-foreground">Médias por contato de radar, amostrado a cada 0,125 s. Abaixo de cada média aparece o número de contatos com aquele evento. Em S. Acc, o número é o total de disparos.</p>}
    {!match.analysis && <p role="status" className="text-sm text-muted-foreground">Análise avançada indisponível para esta demo.</p>}
    {[0, 1].map(team => {
      const players = match.players.filter(p => p.team === team).sort((a,b) => {
        const x = column.value(a,stats(a)), y = column.value(b,stats(b));
        if (x == null || y == null) return Number(x == null) - Number(y == null);
        return sort.ascending ? x-y : y-x;
      });
      const first = players[0];
      if (!first) return null;
      const win = first.scoreFor > first.scoreAgainst, draw = first.scoreFor === first.scoreAgainst;
      return <section key={team} className="rounded-xl border border-border overflow-hidden">
        <header className="flex flex-wrap items-center gap-3 bg-card px-4 py-3">
          <strong className="text-2xl tabular-nums">{first.scoreFor}</strong><h3 className="font-semibold">Time {team+1}</h3>
          <span className={`text-xs ${draw ? 'text-muted-foreground' : win ? 'text-emerald-400' : 'text-red-400'}`}>{draw ? 'Empate' : win ? 'Vitória' : 'Derrota'}</span>
          <div className="ml-auto flex flex-wrap gap-2 text-xs">{match.analysis?.segments.map((s,i) => <span key={i} className="rounded border border-border px-2 py-1">
            {(s.sideA === 3) !== !!team ? 'CT' : 'T'} {s.wins[team]}</span>)}</div>
        </header>
        <div className="overflow-x-auto"><table className="w-full text-sm tabular-nums">
          <thead className="text-xs text-muted-foreground"><tr><th scope="col" className="sticky left-0 bg-background p-3 text-left">Jogador</th>
            {columns.map((c,i) => <th scope="col" key={c.label} aria-sort={sort.index !== i ? 'none' : sort.ascending ? 'ascending' : 'descending'}>
              <button title={c.description} onClick={() => setSort({ index:i, ascending:sort.index === i ? !sort.ascending : !!c.low })}
                className="whitespace-nowrap px-2 py-3">{c.label}{sort.index === i ? (sort.ascending ? ' ↑' : ' ↓') : ''}</button></th>)}</tr></thead>
          <tbody>{players.map(p => <tr key={p.steamId} className="border-t border-border">
            <th scope="row" className={`sticky left-0 bg-background px-3 py-2.5 text-left font-medium ${p.steamId === viewer ? 'text-primary' : ''}`}><span className="block max-w-36 truncate" title={p.name}>{p.name}</span></th>
            {columns.map((c,i) => {
              const v = c.value(p, stats(p)), count = c.count?.(stats(p));
              return <td key={c.label} className={`px-2 py-2 text-center whitespace-nowrap ${i === sort.index ? 'bg-muted/50 font-semibold' : ''}`}>
                {v == null ? '—' : v.toLocaleString('pt-BR',{maximumFractionDigits:c.precision ?? 1}) + (c.unit ?? '')}
                {aim && count != null && <small className="block text-muted-foreground">{count}</small>}</td>;
            })}</tr>)}</tbody>
        </table></div></section>;
    })}
    <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">Como ler as colunas</summary>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">{columns.map(c => <div key={c.label}><dt className="font-semibold text-foreground">{c.label}</dt><dd>{c.description}</dd></div>)}</dl></details>
  </section>;
}
