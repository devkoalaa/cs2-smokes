import { ImageResponse } from 'next/og';
import { BRAND } from '@/lib/brand';
import { loadFonts, mapArtData, titleSize } from '@/lib/og';
import { MapsService } from '@/lib/services/maps.service';

export const alt = 'Smokes do mapa no CS2 Hub';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [map, fonts] = await Promise.all([MapsService.getInstance().getMapById(Number(id)).catch(() => null), loadFonts()]);
  const name = map ? map.displayName || map.name : 'Mapa';
  const art = await mapArtData(name);
  const count = map?.smokesCount ?? 0;
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', fontFamily: 'Geist', color: BRAND.foreground, background: BRAND.gradient }}>
      {art && <img src={art} width={1200} height={630} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', background: 'linear-gradient(90deg, rgba(14,15,18,0.95) 0%, rgba(14,15,18,0.75) 50%, rgba(14,15,18,0.25) 100%)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px' }}>
        <div style={{ display: 'flex', fontSize: 28, letterSpacing: 6, color: BRAND.primary, fontWeight: 600 }}>CS2 HUB · SMOKES</div>
        <div style={{ display: 'flex', fontFamily: 'Display', fontSize: titleSize(name, 190, 900), lineHeight: 1, marginTop: 12, textTransform: 'uppercase' }}>{name}</div>
        <div style={{ display: 'flex', fontSize: 38, marginTop: 20, color: BRAND.muted }}>{count ? `${count} ${count === 1 ? 'granada' : 'granadas'} com vídeo e posição no radar` : 'Smokes, flashes e molotovs com vídeo'}</div>
      </div>
    </div>,
    { ...size, fonts },
  );
}
