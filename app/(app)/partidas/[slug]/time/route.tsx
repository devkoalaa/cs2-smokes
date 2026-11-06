import { ImageResponse } from 'next/og';
import { config } from '@/lib/config';
import { formatDate, hubRating, mapName, modeLabel, parseMatchSlug, resultLabel } from '@/lib/match';
import { background, loadFonts, mapArtData, resultColors } from '@/lib/og';
import type { MatchDetail } from '@/lib/services/tracking.service';

export const dynamic = 'force-dynamic';

const private_ = { 'Cache-Control': 'private, no-store' };
const fail = (status: number, message: string) => Response.json({ message }, { status, headers: private_ });
const fixed = (v: number | null | undefined, digits = 0, suffix = '') => v == null ? '—' : v.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + suffix;

// Imagem da tabela do time de quem pediu. O placar completo é privado: o token
// do usuário vai para a API, que só responde a quem jogou a partida.
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const parsed = parseMatchSlug((await params).slug);
  const auth = request.headers.get('authorization');
  if (!parsed) return fail(404, 'Partida não encontrada.');
  if (!auth?.startsWith('Bearer ')) return fail(401, 'Entre com sua conta Steam para continuar.');
  const response = await fetch(`${process.env.API_INTERNAL_URL || config.apiUrl}/tracking/matches/${parsed.id}`, { headers: { Authorization: auth }, cache: 'no-store' });
  if (!response.ok) return fail(response.status, response.status === 401 ? 'Sua sessão expirou. Entre novamente pela Steam.' : 'Partida não encontrada no seu histórico.');
  const match: MatchDetail = await response.json();
  // A API já validou a assinatura deste mesmo token; aqui só lemos quem é.
  let steamId = '';
  try { steamId = JSON.parse(Buffer.from(auth.slice(7).split('.')[1], 'base64url').toString()).steamId; } catch { /* sem identificação */ }
  const me = match.players.find(p => p.steamId === steamId);
  if (!me) return fail(404, 'Partida não encontrada no seu histórico.');

  const stats = (id: string) => match.analysis?.players[id];
  const premier = !!match.analysis?.premier;
  const team = match.players.filter(p => p.team === me.team)
    .map(p => ({ ...p, rating: hubRating(p, match.players) }))
    .sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || b.kills - a.kills);
  const label = resultLabel(me.scoreFor, me.scoreAgainst), accent = resultColors[label];
  const columns: [string, number, (p: typeof team[number]) => string][] = [
    ['RATING', 110, p => fixed(p.rating, 2)],
    ['K / D / A', 175, p => `${p.kills} / ${p.deaths} / ${p.assists}`],
    ['ADR', 95, p => fixed(p.damage != null && p.rounds ? p.damage / p.rounds : null)],
    ['DANO', 115, p => fixed(p.damage)],
    ['HS', 90, p => fixed(p.headshots != null && p.kills ? 100 * p.headshots / p.kills : null, 0, '%')],
    ['KAST', 95, p => { const s = stats(p.steamId); return fixed(s && p.rounds ? 100 * s.kast / p.rounds : null, 0, '%'); }],
    ...(premier ? [['± PREMIER', 140, (p: typeof team[number]) => { const d = stats(p.steamId)?.premierDelta; return d == null ? '—' : (d > 0 ? '+' : '') + d.toLocaleString('pt-BR'); }] as [string, number, (p: typeof team[number]) => string]] : []),
  ];
  const nameWidth = 1104 - columns.reduce((sum, [, w]) => sum + w, 0);
  const height = 340 + team.length * 62;
  const art = await mapArtData(match.map);

  const image = new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', padding: 48, fontFamily: 'Geist', color: '#fafafa', background }}>
      {art && <img src={art} width={1200} height={height} style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }} />}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', background: 'linear-gradient(180deg, rgba(14,15,18,0.82) 0%, rgba(14,15,18,0.93) 45%, rgba(14,15,18,0.97) 100%)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 84, lineHeight: 1, textTransform: 'uppercase' }}>{mapName(match.map)}</div>
          <div style={{ display: 'flex', fontSize: 24, color: '#a1a1aa', marginTop: 12 }}>{`${modeLabel(match.mode)} · ${formatDate(match.playedAt)} · ${match.rounds} rounds`}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 92, lineHeight: 1 }}>
            <span style={{ color: accent }}>{me.scoreFor}</span><span style={{ color: '#52525b', margin: '0 14px' }}>:</span><span>{me.scoreAgainst}</span>
          </div>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 600, color: accent }}>{label.toUpperCase()}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 40 }}>
        <div style={{ display: 'flex', fontSize: 19, color: '#71717a', padding: '0 16px 10px' }}>
          <div style={{ display: 'flex', width: nameWidth - 32 }}>JOGADOR</div>
          {columns.map(([title, width]) => <div key={title} style={{ display: 'flex', width, justifyContent: 'flex-end' }}>{title}</div>)}
        </div>
        {team.map(p => <div key={p.steamId} style={{ display: 'flex', alignItems: 'center', height: 62, padding: '0 16px', fontSize: 28, borderTop: '1px solid rgba(255,255,255,0.07)',
          background: p.steamId === me.steamId ? 'rgba(225,29,72,0.16)' : 'transparent', borderRadius: p.steamId === me.steamId ? 10 : 0 }}>
          <div style={{ display: 'flex', width: nameWidth - 32, fontWeight: 600, color: p.steamId === me.steamId ? '#fda4af' : '#fafafa', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.name}</div>
          {columns.map(([title, width, value]) => <div key={title} style={{ display: 'flex', width, justifyContent: 'flex-end', fontWeight: title === 'RATING' ? 600 : 400 }}>{value(p)}</div>)}
        </div>)}
      </div>
      <div style={{ display: 'flex', marginTop: 'auto', fontSize: 18, color: '#52525b' }}>cs2.devkoala.com</div>
    </div>,
    { width: 1200, height, fonts: await loadFonts() },
  );
  // O ImageResponse marca a resposta como pública e imutável; esta é pessoal.
  return new Response(image.body, { headers: { 'Content-Type': 'image/png', ...private_ } });
}
