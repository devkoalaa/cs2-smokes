import { ImageResponse } from 'next/og';
import { fetchPreview, formatDate, groupResult, mapName, modeLabel } from '@/lib/match';
import { background, loadFonts, mapArtData, resultColors, titleSize } from '@/lib/og';
import { BRAND } from '@/lib/brand';

export const alt = 'Placar da partida';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const [preview, fonts] = await Promise.all([params.then(p => fetchPreview(p.slug)), loadFonts()]);
  const art = preview && await mapArtData(preview.map);
  const result = preview && groupResult(preview);
  const score = result ? [result.scoreFor, result.scoreAgainst] : preview?.score ?? [];
  const accent = result ? resultColors[result.label] : '#e5e5e5';
  const compact = (preview?.group.length ?? 0) > 3;

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', fontFamily: 'Geist', color: '#fafafa',
      background }}>
      {art && <img src={art} width={1200} height={630} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.35 }} />}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', background: 'linear-gradient(90deg, rgba(14,15,18,0.97) 0%, rgba(14,15,18,0.88) 55%, rgba(14,15,18,0.7) 100%)' }} />
      {!preview ? <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80 }}>
        <div style={{ fontSize: 30, color: BRAND.primary, letterSpacing: 6 }}>CS2 HUB</div>
        <div style={{ fontFamily: 'Display', fontSize: 130, marginTop: 10 }}>PARTIDA</div>
      </div> : <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '56px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 26, color: '#a1a1aa' }}>
          <div style={{ display: 'flex', padding: '6px 16px', borderRadius: 999, background: 'rgba(225,29,72,0.2)', color: '#fda4af', fontWeight: 600 }}>{modeLabel(preview.mode)}</div>
          <div style={{ display: 'flex', marginLeft: 20 }}>{formatDate(preview.playedAt)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 18 }}>
          <div style={{ display: 'flex', fontFamily: 'Display', fontSize: titleSize(mapName(preview.map), 130, 640), lineHeight: 1, textTransform: 'uppercase' }}>{mapName(preview.map)}</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 120, lineHeight: 1 }}>
              <span style={{ color: accent }}>{score[0]}</span><span style={{ color: '#52525b', margin: '0 18px' }}>:</span><span>{score[1]}</span>
            </div>
            {result && <div style={{ display: 'flex', fontSize: 34, fontWeight: 600, color: accent, marginTop: 4 }}>{result.label.toUpperCase()}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
          <div style={{ display: 'flex', fontSize: 20, color: '#71717a', paddingBottom: 8 }}>
            <div style={{ display: 'flex', width: 430 }}>JOGADOR</div><div style={{ display: 'flex', width: 220 }}>K / D / A</div>
            <div style={{ display: 'flex', width: 150 }}>ADR</div><div style={{ display: 'flex', width: 150 }}>HS</div>
          </div>
          {preview.group.slice(0, 5).map(p => <div key={p.name} style={{ display: 'flex', alignItems: 'center', fontSize: compact ? 28 : 34, height: compact ? 46 : 58, borderTop: '1px solid #27272a' }}>
            <div style={{ display: 'flex', width: 430, fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap' }}>{p.name}{!result ? ` · T${p.team + 1}` : ''}</div>
            <div style={{ display: 'flex', width: 220 }}>{`${p.kills} / ${p.deaths} / ${p.assists}`}</div>
            <div style={{ display: 'flex', width: 150 }}>{p.adr ?? '—'}</div>
            <div style={{ display: 'flex', width: 150 }}>{p.hsPercent == null ? '—' : `${p.hsPercent}%`}</div>
          </div>)}
        </div>
      </div>}
    </div>,
    { ...size, fonts },
  );
}
