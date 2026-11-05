import type { Metadata } from 'next';
import { fetchPreview, formatDate, groupResult, mapName, modeLabel } from '@/lib/match';
import { MatchView } from './match-view';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const preview = await fetchPreview(params.slug);
  const robots = { index: false, follow: false };
  if (!preview) return { title: 'Partida | CS2 Smokes Hub', robots };
  const result = groupResult(preview);
  const map = mapName(preview.map).replace(/^./, c => c.toUpperCase());
  const title = result ? `${result.label} na ${map} · ${result.scoreFor} a ${result.scoreAgainst}` : `${map} · ${preview.score[0]} a ${preview.score[1]}`;
  const description = [preview.group.map(p => `${p.name} ${p.kills}/${p.deaths}/${p.assists}`).join(' · '),
    `${modeLabel(preview.mode)} · ${formatDate(preview.playedAt)}`].filter(Boolean).join(' — ');
  return { title, description, robots,
    openGraph: { title, description, type: 'article', url: `/partidas/${params.slug}`, siteName: 'CS2 Smokes Hub', locale: 'pt_BR' },
    twitter: { card: 'summary_large_image', title, description } };
}

export default function MatchPage({ params }: Props) {
  return <MatchView slug={params.slug} />;
}
