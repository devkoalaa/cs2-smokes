import { ImageResponse } from 'next/og';
import { BRAND } from '@/lib/brand';
import { config } from '@/lib/config';
import { loadFonts } from '@/lib/og';

export const alt = 'Convite para o CS2 Hub';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Invite = { inviter: { username: string; avatarUrl: string | null }; group: { name: string; members: number } | null };

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [invite, fonts] = await Promise.all([
    fetch(`${process.env.API_INTERNAL_URL || config.apiUrl}/tracking/invites/${encodeURIComponent(code)}`, { cache: 'no-store', signal: AbortSignal.timeout(5000) })
      .then(r => (r.ok ? r.json() as Promise<Invite> : null)).catch(() => null),
    loadFonts()]);
  const title = invite?.group?.name ?? 'CS2 Hub';
  // Foto baixada antes: se a Steam falhar, a miniatura sai sem ela em vez de quebrar.
  const avatar = invite?.inviter.avatarUrl?.startsWith('https://avatars.steamstatic.com/')
    ? await fetch(invite.inviter.avatarUrl, { signal: AbortSignal.timeout(3000) }).then(async r => r.ok ? `data:image/jpeg;base64,${Buffer.from(await r.arrayBuffer()).toString('base64')}` : null).catch(() => null)
    : null;
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', fontFamily: 'Geist', color: BRAND.foreground, background: BRAND.gradient }}>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 30, color: BRAND.muted }}>
        {avatar && <img src={avatar} width={64} height={64} style={{ borderRadius: 999, marginRight: 20 }} />}
        {invite ? `${invite.inviter.username} te convidou para` : 'Convite para'}
      </div>
      <div style={{ display: 'flex', fontFamily: 'Display', fontSize: title.length > 18 ? 120 : 170, lineHeight: 1, marginTop: 16, textTransform: 'uppercase' }}>{title}</div>
      <div style={{ display: 'flex', fontSize: 34, marginTop: 24, color: BRAND.muted }}>
        {invite?.group ? `${invite.group.members} ${invite.group.members === 1 ? 'pessoa' : 'pessoas'} no grupo · histórico de partidas, mapa de abates e ranking` : 'Histórico de partidas de CS2, mapa de abates e ranking com os amigos'}
      </div>
      <div style={{ display: 'flex', marginTop: 48, padding: '14px 34px', borderRadius: 14, background: BRAND.primary, fontSize: 32, fontWeight: 600, alignSelf: 'flex-start' }}>{invite?.group ? 'Entrar no grupo' : 'Aceitar convite'}</div>
    </div>,
    { ...size, fonts },
  );
}
