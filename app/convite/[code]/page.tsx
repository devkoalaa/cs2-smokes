import type { Metadata } from 'next';
import { config } from '@/lib/config';
import { InviteView } from './invite-view';

type Props = { params: { code: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const robots = { index: false, follow: false };
  try {
    const response = await fetch(`${process.env.API_INTERNAL_URL || config.apiUrl}/tracking/invites/${encodeURIComponent(params.code)}`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!response.ok) return { title: 'Convite', robots };
    const invite = await response.json();
    const title = invite.group ? `Convite para ${invite.group.name}` : 'Convite para o CS2 Hub';
    const description = `${invite.inviter.username} te chamou${invite.group ? ` para o grupo (${invite.group.members} ${invite.group.members === 1 ? 'pessoa' : 'pessoas'})` : ''}. Histórico de partidas de CS2, mapa de abates e ranking com a galera.`;
    return { title, description, robots, openGraph: { title, description, siteName: 'CS2 Hub', locale: 'pt_BR' }, twitter: { card: 'summary_large_image', title, description } };
  } catch { return { title: 'Convite', robots }; }
}

export default function InvitePage({ params }: Props) {
  return <InviteView params={params} />;
}
