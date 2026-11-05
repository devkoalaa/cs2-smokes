import { ImageResponse } from 'next/og';
import { BRAND } from '@/lib/brand';
import { asset, loadFonts } from '@/lib/og';
import { MapsService } from '@/lib/services/maps.service';

export const alt = 'Smokes do mapa no CS2 Hub';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [map, fonts] = await Promise.all([MapsService.getInstance().getMapById(Number(id)).catch(() => null), loadFonts()]);
  const name = map ? map.displayName || map.name : 'Mapa';
  const radar = await asset('images', 'maps', 'og', `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`).then(b => `data:image/png;base64,${b.toString('base64')}`).catch(() => null);
  const count = map?.smokesCount ?? 0;
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', fontFamily: 'Geist', color: BRAND.foreground, background: BRAND.gradient }}>
      {radar && <img src={radar} width={600} height={600} style={{ position: 'absolute', right: -30, top: 15, opacity: 0.3 }} />}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px' }}>
        <div style={{ display: 'flex', fontSize: 28, letterSpacing: 6, color: BRAND.primary, fontWeight: 600 }}>CS2 HUB · SMOKES</div>
        <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 200, lineHeight: 1, marginTop: 12, textTransform: 'uppercase' }}>{name}</div>
        <div style={{ display: 'flex', fontSize: 38, marginTop: 20, color: BRAND.muted }}>{count ? `${count} ${count === 1 ? 'lineup' : 'lineups'} com vídeo e posição no radar` : 'Smokes, flashes e molotovs com vídeo'}</div>
      </div>
    </div>,
    { ...size, fonts },
  );
}
