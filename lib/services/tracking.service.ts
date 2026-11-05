import { AuthService, API_BASE_URL } from '@/lib/auth';

export interface PlayerStats {
  steamId: string; name: string; team: number; kills: number; deaths: number; assists: number;
  headshots: number | null; damage: number | null; rounds: number; scoreFor: number; scoreAgainst: number;
}
export interface Summary {
  matches: number; wins: number; draws: number; kills: number; deaths: number; assists: number;
  rounds: number; kd: number | null; adr: number | null; hsPercent: number | null; winRate: number | null; adrMatches: number;
}
export interface TrackingStatus {
  tracking: { enabled: boolean; lastCheckedAt: string | null; lastError: string | null } | null;
  workerOnline: boolean; workerLastSeen: string | null; serverConfigured: boolean;
  queue: { id: number; status: string; lastError: string | null; attempts: number }[];
}
export interface MatchList {
  evolution: { id: number; playedAt: string; adr: number | null }[];
  summary: Summary; total: number; page: number; maps: string[];
  comparison: { steamId: string; username: string; stats: Summary }[];
  matches: { id: number; mode: string; map: string; playedAt: string; player: PlayerStats }[];
}
export type AimMetric = 'preaim' | 'tts' | 'ttd' | 'ttk';
export interface ReplayStats {
  rank: number | null; kast: number; opening: number; multi: number; clutch: number;
  flashed: number; shots: number; hits: number;
  aim: Partial<Record<AimMetric, { mean: number; n: number }>>;
}
export interface MatchDetail {
  analysis?: { players: Record<string, ReplayStats>; segments: { sideA: number; wins: number[] }[] } | null;
 id: number; mode: string; map: string; playedAt: string; rounds: number; players: PlayerStats[] }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = AuthService.getInstance().getToken();
  if (!token) throw new Error('Entre com sua conta Steam para continuar.');
  const response = await fetch(`${API_BASE_URL}/tracking/${path}`, { ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    if (response.status === 401) throw new Error('Sua sessão expirou. Entre novamente pela Steam.');
    throw new Error(Array.isArray(error?.message) ? error.message.join(' • ') : error?.message || 'Não foi possível acessar as partidas.');
  }
  return response.json();
}
export const trackingApi = {
  status: () => request<TrackingStatus>('status'),
  list: (filters: URLSearchParams) => request<MatchList>(`matches?${filters}`),
  detail: (id: number) => request<MatchDetail>(`matches/${id}`),
  configure: (authCode: string, shareCode: string) => request<{ message: string }>('settings', { method: 'POST', body: JSON.stringify({ authCode, shareCode }) }),
  disconnect: () => request<{ message: string }>('settings', { method: 'DELETE' }),
};
