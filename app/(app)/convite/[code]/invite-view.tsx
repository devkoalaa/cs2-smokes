'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { GroupTile, Pill } from '@/components/kit';
import { rise } from '@/lib/motion';
import { Alert, LoginPrompt, UserAvatar } from '@/components/hub-ui';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { groupsApi, InviteInfo } from '@/lib/services/tracking.service';

export function InviteView({ params }: { params: { code: string } }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { groupsApi.invite(params.code).then(setInvite).catch(e => setError(e.message)); }, [params.code]);

  async function accept() {
    setBusy(true); setError('');
    try {
      const { groupId } = await groupsApi.accept(params.code);
      router.push(groupId ? `/grupos/${groupId}` : '/partidas?conexao=1');
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }

  return <div className="mx-auto max-w-2xl space-y-5">
      {error && <Alert>{error}</Alert>}
      {!invite ? !error && <p role="status" className="text-muted-foreground">Abrindo o convite…</p> : <>
        <section className="relative overflow-hidden rounded-2xl ring-1 ring-white/[0.06]" style={rise(0)}>
          <div aria-hidden className="absolute inset-0 grid grid-cols-3 opacity-40">{['mirage', 'nuke', 'ancient'].map(m => <div key={m} className="bg-cover bg-center" style={{ backgroundImage: `url(/images/maps/art/${m}-sm.webp)` }} />)}</div>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />
          <div className="relative space-y-4 px-6 py-12 text-center md:py-16">
            <div className="flex justify-center">{invite.group ? <GroupTile id={0} name={invite.group.name} className="h-16 w-16 text-xl" />
              : <UserAvatar src={invite.inviter.avatarUrl} name={invite.inviter.username} className="h-16 w-16" />}</div>
            <div>
              <p className="flex items-center justify-center gap-2 text-sm text-zinc-300">{invite.group && <UserAvatar src={invite.inviter.avatarUrl} name={invite.inviter.username} className="h-6 w-6" />}{invite.inviter.username} te convidou para</p>
              <h1 className="mt-2 font-display text-4xl md:text-6xl">{invite.group ? invite.group.name : 'o CS2 Hub'}</h1>
              {invite.group && <div className="mt-3"><Pill>{invite.group.members} {invite.group.members === 1 ? 'pessoa' : 'pessoas'} no grupo</Pill></div>}
            </div>
            <p className="mx-auto max-w-md text-sm text-zinc-300">Seu histórico de partidas de CS2 com placar completo, mapa de abates e{invite.group ? ' ranking com a galera do grupo' : ' links para compartilhar'}.</p>
            {isLoading ? null : !isAuthenticated ? null
              : <Button size="lg" className="shadow-lg shadow-rose-950/50" onClick={() => void accept()} disabled={busy}>{busy ? 'Entrando…' : invite.group ? 'Entrar no grupo' : 'Aceitar convite'}<ArrowRight className="h-4 w-4" /></Button>}
          </div>
        </section>
        {!isLoading && !isAuthenticated && <LoginPrompt title="Entre para aceitar" text="Depois do login com a Steam você volta para esta página e entra com um clique." />}
      </>}
    </div>;
}
