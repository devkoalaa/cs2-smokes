import { config } from './config';

export const mapName = (value: string) => value.replace(/^de_/, '').replace(/_/g, ' ');
export const modeLabel = (mode: string) => mode === 'wingman' ? 'Duplas 2×2' : 'Competitivo 5×5';
export const formatDate = (value: string | Date, style: 'short' | 'long' = 'short') => new Date(value).toLocaleString('pt-BR', {
  timeZone: 'America/Sao_Paulo', ...(style === 'long' ? { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' } : { dateStyle: 'short', timeStyle: 'short' }),
});
export const formatNumber = (value: number | null | undefined, suffix = '') => value == null ? '—' : value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + suffix;
export const resultLabel = (scoreFor: number, scoreAgainst: number) => scoreFor === scoreAgainst ? 'Empate' : scoreFor > scoreAgainst ? 'Vitória' : 'Derrota';
export const resultColor = (scoreFor: number, scoreAgainst: number) => scoreFor === scoreAgainst ? 'text-amber-300' : scoreFor > scoreAgainst ? 'text-emerald-400' : 'text-red-400';

// O link leva a chave da partida para a miniatura pública; sem ela, só quem participou vê.
export const matchPath = (id: number, shareKey?: string | null) => `/partidas/${id}${shareKey ? '-' + shareKey : ''}`;
export function parseMatchSlug(slug: string) {
  const match = /^(\d{1,9})(?:-([a-f0-9]{16}))?$/.exec(slug);
  return match ? { id: Number(match[1]), key: match[2] ?? null } : null;
}

export interface MatchPreview {
  id: number; mode: string; map: string; playedAt: string; rounds: number; score: [number, number];
  group: { name: string; team: number; kills: number; deaths: number; assists: number; adr: number | null; hsPercent: number | null }[];
}

// Usada no servidor (metadados e miniatura). O resultado não muda depois de importado.
export async function fetchPreview(slug: string): Promise<MatchPreview | null> {
  const parsed = parseMatchSlug(slug);
  if (!parsed?.key) return null;
  try {
    const base = process.env.API_INTERNAL_URL || config.apiUrl;
    const response = await fetch(`${base}/tracking/preview/${parsed.id}/${parsed.key}`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
    return response.ok ? await response.json() : null;
  } catch { return null; }
}

// Resultado do ponto de vista do grupo; null quando o grupo jogou em times opostos.
export function groupResult(preview: MatchPreview) {
  const teams = [...new Set(preview.group.map(p => p.team))];
  if (teams.length !== 1) return null;
  const scoreFor = preview.score[teams[0]], scoreAgainst = preview.score[1 - teams[0]];
  return { scoreFor, scoreAgainst, label: resultLabel(scoreFor, scoreAgainst) };
}

type RatingRow = { kills: number; assists: number; damage: number | null };
// Compara a contribuição com a dos jogadores da mesma partida, para 2×2 e 5×5
// terem cada um sua referência (1,00 = média). Sem dano de alguém, fica indisponível.
export function hubRating(p: RatingRow, players: RatingRow[]) {
  if (players.some(row => row.damage == null)) return null;
  const total = players.reduce<{ kills: number; assists: number; damage: number }>((sum, row) => ({ kills: sum.kills + row.kills, assists: sum.assists + row.assists, damage: sum.damage + (row.damage ?? 0) }),
    { kills: 0, assists: 0, damage: 0 });
  const metrics: [number, number, number][] = [[p.kills, total.kills, 0.5], [p.damage ?? 0, total.damage, 0.35], [p.assists, total.assists, 0.15]];
  const available = metrics.filter(([, sum]) => sum > 0);
  const weights = available.reduce((sum, [, , weight]) => sum + weight, 0);
  return weights ? available.reduce((sum, [v, all, weight]) => sum + weight * v / all, 0) * players.length / weights : null;
}
