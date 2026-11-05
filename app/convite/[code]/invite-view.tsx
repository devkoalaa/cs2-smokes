'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { Header } from '@/components/header';
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

  return <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto max-w-xl px-4 py-10 md:py-16 space-y-6">
      {error && <Alert>{error}</Alert>}
      {!invite ? !error && <p role="status" className="text-muted-foreground">Abrindo o convite…</p> : <>
        <section className="rounded-xl border border-border bg-card/50 p-6 md:p-8 text-center space-y-4">
          {invite.group ? <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary"><Users className="h-7 w-7" /></span>
            : <UserAvatar src={invite.inviter.avatarUrl} name={invite.inviter.username} className="mx-auto h-14 w-14" />}
          <div>
            <p className="text-sm text-muted-foreground">{invite.inviter.username} te convidou para</p>
            <h1 className="font-display text-5xl mt-1">{invite.group ? invite.group.name : 'o CS2 Hub'}</h1>
            {invite.group && <p className="text-sm text-muted-foreground mt-1">{invite.group.members} {invite.group.members === 1 ? 'pessoa' : 'pessoas'} no grupo</p>}
          </div>
          <p className="text-sm text-muted-foreground">Seu histórico de partidas de CS2 com placar completo, mapa de abates e{invite.group ? ' ranking com a galera do grupo' : ' links para compartilhar'}.</p>
          {isLoading ? null : !isAuthenticated ? null
            : <Button size="lg" onClick={() => void accept()} disabled={busy}>{busy ? 'Entrando…' : invite.group ? 'Entrar no grupo' : 'Aceitar convite'}</Button>}
        </section>
        {!isLoading && !isAuthenticated && <LoginPrompt text="Entre com a Steam para aceitar. Depois do login você volta para esta página." />}
      </>}
    </main>
  </div>;
}
