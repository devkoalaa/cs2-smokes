import { AuthService, API_BASE_URL } from '@/lib/auth';

export interface PlayerStats {
  steamId: string; name: string; team: number; kills: number; deaths: number; assists: number;
  headshots: number | null; damage: number | null; rounds: number; scoreFor: number; scoreAgainst: number;
}
export interface Summary {
  matches: number; wins: number; draws: number; kills: number; deaths: number; assists: number;
  rounds: number; kd: number | null; adr: number | null; hsPercent: number | null; winRate: number | null; adrMatches: number;
}
export interface GroupSummary { id: number; name: string; owner: boolean; members: number; avatarUrl: string | null }
/** Banner do perfil: imagem enviada (url) ou mapa escolhido (map); sem nenhum, o mapa mais jogado. */
export interface Banner { map: string | null; url: string | null }
export interface TrackingStatus {
  access: boolean; admin: boolean; seats: { used: number; max: number }; allowPreview: boolean; groups: GroupSummary[]; banner: Banner;
  tracking: { enabled: boolean; lastCheckedAt: string | null; lastError: string | null } | null;
  workerOnline: boolean; workerLastSeen: string | null; serverConfigured: boolean;
  queue: { id: number; status: string; lastError: string | null; attempts: number }[];
}
export interface MatchList {
  evolution: { id: number; playedAt: string; adr: number | null }[];
  summary: Summary; total: number; page: number; maps: string[];
  comparison: { steamId: string; username: string; stats: Summary }[];
  matches: { id: number; shareKey: string | null; mode: string; map: string; playedAt: string; player: PlayerStats }[];
}
export type AimMetric = 'preaim' | 'tts' | 'ttd' | 'ttk';
export interface ReplayStats {
  premierAfter?: number; premierDelta?: number;
  rank: number | null; kast: number; opening: number; multi: number; clutch: number;
  flashed: number; shots: number; hits: number;
  aim: Partial<Record<AimMetric, { mean: number; n: number }>>;
}
export interface Kill {
  round: number; time: number; attacker: string | null; victim: string; weapon: string; headshot: boolean;
  attackerPos: number[] | null; victimPos: number[] | null; attackerSide: 'CT' | 'T' | null; victimSide: 'CT' | 'T' | null;
}
export interface MatchDetail {
  analysis?: { premier?: boolean; players: Record<string, ReplayStats>; segments: { sideA: number; wins: number[] }[]; kills?: Kill[] } | null;
 id: number; shareKey: string | null; mode: string; map: string; playedAt: string; rounds: number; players: PlayerStats[] }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = AuthService.getInstance().getToken();
  if (!token) throw new Error('Entre com sua conta Steam para continuar.');
  // FormData (upload de imagem): o navegador monta o Content-Type com o boundary.
  const upload = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}/tracking/${path}`, { ...options,
    headers: { ...(upload ? {} : { 'Content-Type': 'application/json' }), Authorization: `Bearer ${token}` }, cache: 'no-store' });
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

export interface PublicUser { id: number; steamId: string; username: string; avatarUrl: string | null }
export interface PeriodStats extends Summary { rating: number | null }
export interface PlayerLine { steamId: string; name: string; kills: number; deaths: number; assists: number; damage: number | null; adr: number | null;
  hsPercent: number | null; kastPercent: number | null; rating: number | null; premierAfter: number | null; premierDelta: number | null }
export interface MatchCard { id: number; map: string; mode: string; playedAt: string; rounds: number; scoreFor: number; scoreAgainst: number;
  player: PlayerLine; teammates: PlayerLine[]; viewerPlayed: boolean }
export interface GroupDetail {
  id: number; name: string; avatarUrl: string | null; createdAt: string; owner: boolean; ownerId: number; invite: string | null; days: number;
  limits: { groupsPerUser: number; membersPerGroup: number };
  members: (PublicUser & { joinedAt: string; owner: boolean; stats: PeriodStats })[];
  together: (MatchCard & { players: PlayerLine[] })[];
}
export interface Profile {
  user: { steamId: string; username: string; avatarUrl: string | null; memberSince: string; importing: boolean; self: boolean; banner: Banner };
  days: number; stats: PeriodStats; best: MatchCard | null; maps: { map: string; matches: number; wins: number }[];
  recent: MatchCard[]; groups: { id: number; name: string; members: number; avatarUrl: string | null }[];
}
export interface InviteInfo { kind: 'ACCESS' | 'GROUP'; inviter: { username: string; avatarUrl: string | null }; group: { name: string; members: number; avatarUrl: string | null } | null }
export interface AdminOverview {
  seats: { used: number; max: number }; founders: string[];
  invites: { code: string; usesLeft: number | null; createdAt: string }[];
  users: (PublicUser & { accessGrantedAt: string; importing: boolean; groups: number })[];
}

async function publicRequest<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/tracking/${path}`, { cache: 'no-store' });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || 'Não foi possível carregar.');
  return response.json();
}
const form = (file: File) => { const data = new FormData(); data.append('file', file); return data; };

/** As imagens enviadas vêm como caminho do site (/api/...); vira endereço completo da API. */
export const mediaUrl = (path?: string | null) => path ? new URL(path, API_BASE_URL).href : null;

/** Confere antes de mandar: a API aceita até 6 MB em JPG, PNG ou WebP. */
export function checkImage(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Use uma imagem JPG, PNG ou WebP.';
  if (file.size > 6 * 1024 * 1024) return 'A imagem passa de 6 MB.';
  return null;
}

const json = (method: string, body?: unknown): RequestInit => ({ method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });

export const groupsApi = {
  create: (name: string) => request<{ id: number }>('groups', json('POST', { name })),
  get: (id: number, days: number) => request<GroupDetail>(`groups/${id}?days=${days}`),
  rename: (id: number, name: string) => request<{ name: string }>(`groups/${id}`, json('PATCH', { name })),
  remove: (id: number) => request<{ message: string }>(`groups/${id}`, json('DELETE')),
  rotateInvite: (id: number) => request<{ code: string }>(`groups/${id}/invite`, json('POST')),
  removeMember: (id: number, userId: number) => request<{ message: string }>(`groups/${id}/members/${userId}`, json('DELETE')),
  profile: (steamId: string, days: number) => request<Profile>(`profiles/${steamId}?days=${days}`),
  invite: (code: string) => publicRequest<InviteInfo>(`invites/${encodeURIComponent(code)}`),
  accept: (code: string) => request<{ groupId: number | null }>(`invites/${encodeURIComponent(code)}/accept`, json('POST')),
  preferences: (allowPreview: boolean) => request<{ allowPreview: boolean }>('me', json('PATCH', { allowPreview })),
  bannerMap: (map: string | null) => request<{ bannerMap: string | null }>('me', json('PATCH', { bannerMap: map })),
  uploadBanner: (file: File) => request<{ url: string }>('me/banner', { method: 'PUT', body: form(file) }),
  removeBanner: () => request<{ url: null }>('me/banner', json('DELETE')),
  uploadGroupAvatar: (id: number, file: File) => request<{ url: string }>(`groups/${id}/avatar`, { method: 'PUT', body: form(file) }),
  removeGroupAvatar: (id: number) => request<{ url: null }>(`groups/${id}/avatar`, json('DELETE')),
  deleteMine: () => request<{ message: string }>('me', json('DELETE')),
  admin: () => request<AdminOverview>('admin'),
  createAccessInvite: (uses: number) => request<{ code: string; usesLeft: number }>('admin/invites', json('POST', { uses })),
  deleteAccessInvite: (code: string) => request<{ message: string }>(`admin/invites/${code}`, json('DELETE')),
  revokeAccess: (userId: number) => request<{ message: string }>(`admin/users/${userId}/access`, json('DELETE')),
};
